# TRADE_TERMINAL // WHALE_FLOW v3.0

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-React_19_TypeScript_Tailwind-black)
![AI Engine](https://img.shields.io/badge/AI_Inference-Groq_Llama_3.3_70B-red)
![Deployment](https://img.shields.io/badge/deploy-Vercel-black)

## 🌐 [EXPLORE THE LIVE TERMINAL](https://v0-tradeterminal.vercel.app/)

> **"Signal is brilliance. Noise is darkness. Trade with the Whales."**

## // EXECUTIVE SUMMARY
**TradeTerminal** is an AI-native financial intelligence workstation built to decode institutional trade flow. By leveraging specialized AI agents and high-speed inference, it transforms thousands of raw trade signals into a clean, actionable narrative. 

Developed with an **AI-First** philosophy, TradeTerminal focuses on reducing cognitive load for analysts by scoring conviction, predicting narratives, and providing instant adversarial peer reviews for every major "Whale" move.

---

## // THE AI ARCHITECTURE (PROXIMITY AGENTS)

The core of TradeTerminal is its integration with **Groq**, utilizing the **Llama 3.3 70B** model for near-instant (sub-200ms) inference. The system employs a multi-agent logic flow:

### 1. ⚡ The Luminance Agent (Visual Context)
- **Function**: Algorithmic scoring of trade conviction.
- **Logic**: Combines Value, Relative Size (RS), and Sector Momentum into a `WhaleForceScore`.
- **UX**: High-conviction signals (>80) physically **glow** with neon aesthetics, while noise is suppressed via opacity shifts.

### 2. 📖 REQ Narrative Agent (The Analyst)
- **Function**: Converts raw trade data into human-readable conviction statements.
- **Logic**: Ingests ticker metadata and institutional block size to "tell the story" of the entry.
- **Example**: *"Aggressive accumulation in Technology sector, targeting semi-conductor recovery."*

### 3. 🛡️ Adversarial Peer Review (The Bear)
- **Function**: Hostile "Red Team" analysis.
- **Logic**: For every bullish signal, this agent generates a 2-sentence bearish case to prevent trader confirmation bias.
- **Goal**: Skeptical exposure of risks like "Gamma Trap" or "Liquidity Exhaustion."

### 4. 📰 Macro Synthesis (Daily Brief)
- **Function**: Executive summary of the entire session.
- **Logic**: Aggregates 50+ institutional blocks into the 3 most critical market-wide rotation insights.

### 5. 🔊 Command Control (Natural Language Interface)
- **Function**: Dashboard filtering via natural language.
- **Logic**: Uses Llama 3.3 to parse queries like *"Show me massive tech blocks from today"* into optimized internal filters.

---

## // CORE FEATURES

### 🗺️ Liquidity Map
A high-fidelity visualizer for market value distribution, highlighting where the most significant capital is being deployed across sectors.

### 📊 Sector Leaderboard & Alpha Scoring
Real-time tracking of sector velocity. Identification of "Alpha" sectors where institutional conviction is accelerating faster than the broader index.

### 🏛️ The Vault
A robust, auto-indexing data pipeline that ingests commercial institutional flow (CSV/JSON) and normalizes it against "Schema Drift."

### 📱 Intelligence Sidebar
A contextual sidebar that activates when a trade is selected, providing a deep-dive into the AI Narrative, Peer Review, and Technical Defence scores.

---

## // TECH STACK

- **Frontend**: React 19 (Hooks, Error Boundaries)
- **Build Tool**: Vite 6 (Manual Chunk Optimization)
- **Database**: Supabase (PostgreSQL) - Persistent Storage
- **Styling**: Vanilla CSS + Tailwind (Custom Glassmorphism & Neon Design System)
- **AI Inference**: Groq SDK (Llama 3.3 70B Versatile)
- **Type Safety**: TypeScript 5.8 (Strict Mode)
- **Architecture**: Atomic Components with Context-based Store.

---

## // ARCHITECTURE DIAGRAM

```mermaid
graph TD
    classDef ai fill:#f96,stroke:#333,stroke-width:2px;
    classDef ui fill:#bbf,stroke:#333,stroke-width:2px;
    classDef data fill:#dfd,stroke:#333,stroke-width:2px;

    subgraph Data Layer
    A["Institutional CSV/API"] --> B["The Vault (Normalizer)"]
    B --> C["WhaleForce Engine (Algo)"]
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

    C --> J["Luminance Effects (CSS Glow)"]
```

---

## // INSTALLATION

1. **Clone & Install**
   ```bash
   git clone https://github.com/kuberaplutus224/TradeTerminal.git
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root:
   ```env
   GROQ_API_KEY=gsk_...
   ```

3. **Inbound Deployment**
   ```bash
   npm run build
   ```

---

*Built for High-Conviction Traders. Signal is everything.*
