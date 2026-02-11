# TRADE_TERMINAL // WHALE_FLOW v4.0

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-React_19_TypeScript_Tailwind-black)
![AI Engine](https://img.shields.io/badge/AI_Inference-Groq_Llama_3.3_70B-red)
![Database](https://img.shields.io/badge/storage-Supabase_PostgreSQL-blue)
![Deployment](https://img.shields.io/badge/deploy-Vercel-black)

## 🌐 [EXPLORE THE LIVE TERMINAL](https://v0-tradeterminal.vercel.app/)

> **"Signal is brilliance. Noise is darkness. Trade with the Whales."**

## // EXECUTIVE SUMMARY
**TradeTerminal** is an AI-native financial intelligence workstation built to decode institutional trade flow. By leveraging specialized AI agents and high-speed inference, it transforms thousands of raw trade signals into a clean, actionable narrative with a focus on **Institutional Ingestion** and **Data Integrity**.

The system now features a robust, calendar-locked ingestion pipeline designed to mirror real-world exchange hours and data schemas.

---

## // THE AI ARCHITECTURE (PROXIMITY AGENTS)

The core of TradeTerminal is its integration with **Groq**, utilizing the **Llama 3.3 70B** model for near-instant (sub-200ms) inference. 

### Core AI Agents:
- **⚡ The Luminance Agent**: Algorithmic scoring of trade conviction (`WhaleForceScore`).
- **📖 REQ Narrative Agent**: Converts raw trade blocks into human-readable entry stories.
- **🛡️ Adversarial Peer Review**: Generates "Red Team" bearish cases for every signal to kill confirmation bias.
- **📰 Macro Synthesis**: Daily briefing on critical sector rotation and institutional positioning.
- **🔊 Command Control**: Natural language dashboard filtering (e.g., *"Show me massive semiconductors from today"*).

---

## // INSTITUTIONAL INGESTION (THE VAULT)

The **Vault** has been upgraded to a professional-grade ingestion engine capable of handling institutional-style data exports.

### 📊 Multi-Format Ingestion
- **Native Support**: Full support for `.XLSX`, `.XLS`, and `.CSV` documents.
- **Fuzzy Header Mapping**: Intelligent matching engine that can identify columns like `Ticker (#T)`, `$$`, `Price`, and `Shares` regardless of casing or symbols.
- **Multi-Row Scanning**: Automatically deep-scans the first 10 rows of any document to locate the true data header, effectively bypassing metadata and title rows.

### 🏛️ Market Calendar Guard
- **Schedule Synchronicity**: Hard-coded **NYSE/NASDAQ 2026 Holiday Schedule**.
- **Upload Restrictions**: Blocks all data ingestion on Saturdays, Sundays, and major Exchange holidays (e.g., Martin Luther King Jr. Day, Thanksgiving, etc.).
- **UI Locking**: The ingestion engine physically locks its interface on non-trading days with clear status feedback.

### 🧹 Auto-Cleaning & Integrity
- **CP Removal**: Automatically identifies and strips out "Current Price" columns before storage.
- **Deduplication**: A transaction-level compression engine that prevents duplicate row ingestion ("ON CONFLICT" protection).
- **Currency Normalization**: Cleans currency symbols ($) and commas from financial strings automatically.

---

## // TECH STACK

- **Frontend**: React 19 (Hooks, Error Boundaries)
- **Database**: **Supabase (PostgreSQL)** - Persistent institutional storage.
- **AI Inference**: **Groq SDK** (Llama 3.3 70B Versatile).
- **Excel Handling**: `xlsx` (SheetJS).
- **Styling**: Vanilla CSS + Tailwind (Custom Glassmorphism & Neon Design System).
- **Type Safety**: TypeScript 5.8 (Strict Mode).

---

## // ARCHITECTURE DIAGRAM

```mermaid
graph TD
    classDef ai fill:#f96,stroke:#333,stroke-width:2px;
    classDef ui fill:#bbf,stroke:#333,stroke-width:2px;
    classDef data fill:#dfd,stroke:#333,stroke-width:2px;

    subgraph Data Layer
    A["Excel/CSV Document"] --> B["The Vault (Deep Scan)"]
    K["Market Calendar Guard"] -- Blocks --> B
    B --> C["WhaleForce Engine (Algo)"]
    C --> L[("Supabase DB")]
    end

    subgraph AI Inference Layer (Groq)
    C --> D["Llama 3.3: Narrative Agent"]:::ai
    C --> E["Llama 3.3: Peer Review"]:::ai
    C --> F["Llama 3.3: Command Parser"]:::ai
    end

    subgraph Interface Layer
    G["Command Bar"] --> F
    F -->|Filter| H["Dashboard View"]:::ui
    H -->|Select Trade| I["Intelligence Sidebar"]:::ui
    D & E --> I
    end
```

---

## // INSTALLATION & SETUP

1. **Clone & Install**
   ```bash
   git clone https://github.com/kuberaplutus224/TradeterminalGroq.git
   npm install
   ```

2. **Environment Configuration** (`.env`)
   ```env
   GROQ_API_KEY=gsk_your_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Database Setup**
   Ensure your Supabase `trades` table has a unique constraint on `(ticker, last_date, time, value)` to support deduplication.

4. **Launch Application**
   ```bash
   npm run dev
   ```

---

*Built for High-Conviction Traders. Signal is everything.*
