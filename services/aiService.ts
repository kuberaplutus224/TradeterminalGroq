import Groq from "groq-sdk";
import { Trade, NaturalFilter } from '../types';

// SEC-03: Groq client now routes through Vite dev proxy (no real API key in browser)
let groq: Groq | null = null;
function getGroq(): Groq {
  if (!groq) {
    const baseURL = `${window.location.origin}/api/groq`;
    console.log("[AI Service] Initializing Groq SDK with baseURL:", baseURL);
    groq = new Groq({
      apiKey: 'gsk_proxy_placeholder_key_to_bypass_sdk_validation',
      baseURL: baseURL,
      dangerouslyAllowBrowser: true
    });
  }
  return groq;
}

const MODEL = "llama-3.3-70b-versatile";

// SEC-04: Sanitize user input before embedding in AI prompts
const sanitizeInput = (input: string, maxLength: number = 500): string => {
  return input
    .slice(0, maxLength)                // Limit length
    .replace(/[{}[\]<>]/g, '')          // Strip structural characters
    .replace(/\\/g, '')                 // Strip backslashes
    .replace(/\n/g, ' ')               // Flatten newlines
    .trim();
};

// SEC-05: Safe JSON parser with type validation
const safeParseJSON = <T>(text: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(text);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch {
    console.warn("Failed to parse AI response as JSON:", text?.slice(0, 100));
    return fallback;
  }
};

export const generateDailyBrief = async (trades: Trade[]): Promise<string[]> => {
  const summaryData = trades
    .sort((a, b) => b.value - a.value)
    .slice(0, 50)
    .map(t => `${t.ticker} (${t.sector}): $${(t.value / 1000000).toFixed(1)}M, RS (Size):${t.rs.toFixed(1)}, Rank:${t.rank || 'N/A'}`)
    .join('\n');

  try {
    const prompt = `Analyze this list of institutional trades. RS = Relative Size (how big this trade is compared to ticker average).
      Identify 3 critical insights regarding sector rotation (where money is flowing) and unusual block sizes (High RS). 
      
      Format Requirements:
      - Return a JSON array of 3 strings.
      - Keep each string under 20 words.
      - Professional, hedge-fund analyst tone.
      - Return ONLY the JSON array.

      Data:
      ${summaryData}`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a senior hedge fund analyst. Output raw JSON ONLY." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) return ["Analysis unavailable."];

    // SEC-05: Safe JSON parsing with fallback
    const parsed = safeParseJSON<any>(text, null);
    if (!parsed) return ["Analysis unavailable."];

    const result = Array.isArray(parsed) ? parsed : (parsed.insights || Object.values(parsed)[0] || []);
    // Validate that result items are strings
    return Array.isArray(result) ? result.filter((item: unknown) => typeof item === 'string').slice(0, 5) : ["Analysis unavailable."];
  } catch (error) {
    console.error("Groq Brief Error:", error);
    return ["System currently unable to generate brief.", "Check API connection.", "Try again later."];
  }
};

export const generateAnomalyDetection = async (trades: Trade[]): Promise<string[]> => {
  const highValue = [...trades].sort((a, b) => b.value - a.value).slice(0, 30);
  const highRS = [...trades].sort((a, b) => b.rs - a.rs).slice(0, 30);
  const lowRank = trades.filter(t => t.rank !== null).sort((a, b) => (a.rank || 100) - (b.rank || 100)).slice(0, 20);

  const combined = new Map();
  [...highValue, ...highRS, ...lowRank].forEach(t => combined.set(t.id, t));
  const dataset = Array.from(combined.values());

  const summaryData = dataset
    .map(t => `Ticker:${t.ticker}, Sec:${t.sector}, Ind:${t.industry}, Val:$${(t.value / 1000000).toFixed(1)}M, RS(Size):${t.rs.toFixed(1)}, Rank:${t.rank || 'N/A'}, TP:${t.tradePrice}`)
    .join('\n');

  try {
    const prompt = `
      Role: Senior Quantitative Analyst
      Objective: Perform a cross-sector correlation analysis on the provided trade data to identify institutional anomalies.
      NOTE: RS = Relative Size. A High RS means this specific trade block was massive compared to the ticker's average trade size.

      Data:
      ${summaryData}

      Output Requirements:
      Return a JSON object with a key "anomalies" containing exactly 3 strings. 
      Each string MUST start with one of these tags:
      "[Cluster Alert]: "
      "[Institutional Floor]: "
      "[Sector Rotation]: "
      
      Keep descriptions professional, punchy, and under 25 words.
      `;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a senior quantitative analyst. Output raw JSON ONLY." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) return ["Anomaly detection failed."];

    // SEC-05: Safe JSON parsing
    const parsed = safeParseJSON<any>(text, null);
    if (!parsed) return ["Anomaly detection failed."];

    const result = parsed.anomalies || Object.values(parsed)[0] || ["Analysis failed."];
    return Array.isArray(result) ? result.filter((item: unknown) => typeof item === 'string').slice(0, 5) : ["Analysis failed."];
  } catch (error) {
    console.error("Groq Anomaly Error:", error);
    return ["Quant layer temporarily offline.", "Unable to process correlation matrix."];
  }
};

export const generateTradeNarrative = async (trade: Trade): Promise<string> => {
  try {
    const prompt = `Generate a 'Conviction Statement' for this institutional trade.
      
      Trade Data:
      Ticker: ${trade.ticker}
      Sector: ${trade.sector}
      Value: $${(trade.value / 1000000).toFixed(1)}M
      Relative Size (RS): ${trade.rs}
      Rank: ${trade.rank || 'Unranked'}
      
      Instructions:
      - Write exactly ONE sentence.
      - MAX 15 words.
      - Focus on the Relative Size (RS) and Rank.
      - If Rank is 1, use the words "Historic Genesis Entry".
      - Style: Punchy, Bloomberg Terminal note.`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a financial desk analyst. Be extremely concise." },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0]?.message?.content || "Analysis unavailable.";
  } catch (error) {
    console.error("Groq Narrative Error:", error);
    return "Intelligence layer temporarily offline.";
  }
};

export const generatePeerReview = async (trade: Trade): Promise<string> => {
  try {
    const prompt = `Act as a skeptical short-seller analyst. Review this institutional trade for potential weaknesses.

      Trade Data:
      Ticker: ${trade.ticker}
      Value: $${(trade.value / 1000000).toFixed(1)}M
      RS: ${trade.rs}
      Rank: ${trade.rank || 'Unranked'}

      Instructions:
      - Identify 2 bearish risks.
      - Write exactly 2 sentences.
      - Tone: Critical, warning.
      - NO intros. Just the bear case.`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a skeptical short-seller. Be critical and direct." },
        { role: "user", content: prompt }
      ]
    });

    return completion.choices[0]?.message?.content || "Review unavailable.";
  } catch (error) {
    console.error("Groq Peer Review Error:", error);
    return "System unable to process critical review.";
  }
};

// SEC-10: Allowed keys for NaturalFilter to prevent injection of unexpected properties
const ALLOWED_FILTER_KEYS = new Set<string>([
  'sector', 'industry', 'min_value', 'max_value',
  'min_rs', 'max_rs', 'min_rank', 'max_rank',
  'ticker', 'description'
]);

const sanitizeFilter = (raw: any): NaturalFilter | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const clean: Record<string, any> = {};
  for (const key of Object.keys(raw)) {
    if (ALLOWED_FILTER_KEYS.has(key)) {
      clean[key] = raw[key];
    }
  }

  // Must have at least one meaningful filter key
  if (Object.keys(clean).length === 0) return null;
  if (Object.keys(clean).length === 1 && clean.description) return null;

  return clean as NaturalFilter;
};

export const parseCommand = async (query: string): Promise<NaturalFilter | null> => {
  // SEC-04: Sanitize user input before embedding in prompt
  const sanitizedQuery = sanitizeInput(query);
  if (!sanitizedQuery) return null;

  try {
    const prompt = `Translate this trading query into a JSON filter object.
      
      Query: "${sanitizedQuery}"
      
      Rules:
      - 'Big Value' > 10000000 (10M).
      - 'Huge Block' implies min_rs > 10.
      - 'Top' implies max_rank.
      - match sectors fuzzily.
      - Provide a short 'description'.
      
      Return a valid JSON object.`;

    const completion = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "Analyze query and return filter JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) return null;

    // SEC-05: Safe parsing + SEC-10: Sanitize filter output
    const parsed = safeParseJSON<any>(text, null);
    if (!parsed) return null;

    return sanitizeFilter(parsed);
  } catch (error) {
    console.error("Groq Command Parse Error:", error);
    return null;
  }
};