# KRISHAK-G: MASTER PROJECT BIBLE
> **Version**: 1.0  
> **Status**: Permanent Source of Truth & Architecture Specification  
> **Target Event**: Rime AI Hackathon  

---

## 1. Vision

**Krishak-G is India's First Voice Native Agricultural Operating System.**

It is NOT an AI chatbot, a text-first app, or a simple weather widget. Voice IS the operating system. The screen and dashboard are purely visual representations that automatically follow the voice conversation. Removing voice makes the product unusable because voice controls every navigation, card opening, page scrolling, and data query hands-free.

---

## 2. Mission

To maximize hackathon judging score by building a production-quality, voice-native field companion that enables farmers in real field conditions—with occupied or dirty hands—to interact naturally in Hindi or English without ever touching or typing on their phones.

---

## 3. Product Philosophy

- **Voice Primary, UI Secondary**: Voice drives the application; the application never drives the voice.
- **Companion, Not Chatbot**: Sound like an experienced, knowledgeable, warm agricultural officer/neighbor helping out in the field.
- **Zero Touch Requirement**: A farmer standing in a field with mud on their hands can perform every action completely hands-free.
- **Preservation First**: Never rewrite working logic, change ports (`4000`/`3000`), break Rime integration, or remove Hindi/multilingual support.

---

## 4. User Persona

- **Target User**: Indian farmer standing inside an agricultural field.
- **Field Conditions**: Hands dirty, hands occupied with tools/crop care, phone in pocket or placed nearby.
- **Constraints**: Cannot type on a keyboard, cannot scroll manually, cannot navigate complex drop-downs.
- **Language**: Prefers spoken Hindi (Devanagari) or simple everyday English.

---

## 5. Complete Architecture

```
                                  ┌───────────────────────────────────────────────────┐
                                  │                  CLIENT LAYER                     │
                                  │  - React 19 + Vite 6 Single Page App              │
                                  │  - Silero VAD (Client WASM in /vad/ & /ort/)     │
                                  │  - Voice Native UI Layer (Glassmorphism Cards)    │
                                  └─────────────────────────┬─────────────────────────┘
                                                            │ HTTP / Multipart Audio
                                                            ▼
                                  ┌───────────────────────────────────────────────────┐
                                  │                  SERVER LAYER                     │
                                  │  - Node.js + Express (TypeScript, Port 4000)      │
                                  │  - Session Manager & Memory Engine                │
                                  │  - Latency Tracker & CORS Header Handler          │
                                  └──────────────┬──────────┬───────────┬─────────────┘
                                                 │          │           │
                     ┌───────────────────────────┘          │           └──────────────────────────┐
                     ▼                                      ▼                                      ▼
     ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
     │       STT ENGINE          │      │       LLM ENGINE          │      │       TTS ENGINE          │
     │ Groq Whisper Turbo        │      │ Groq Llama 3 70B          │      │ Rime AI WebSocket (v3)    │
     │ Auto Hindi/Urdu Remap     │      │ AGMARKNET & Open-Meteo    │      │ - coda (Hindi)            │
     │ Devanagari Normalization  │      │ Structured Tool Execution │      │ - astra (English)         │
     └───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

---

## 6. Folder Structure

```
d:\krishak-g\
├── PROJECT_BIBLE.md                       # Permanent Source of Truth (This File)
├── backend/
│   ├── output/                            # Generated latency logs (latency-log.jsonl)
│   ├── src/
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── ConversationLog.ts     # Turn-by-turn conversation schema
│   │   │   │   └── FarmerProfile.ts       # Profile & farmer memory schema
│   │   │   └── connectDB.ts               # MongoDB Mongoose connector
│   │   ├── llm/
│   │   │   └── LLMClient.ts               # Llama 3 70B client & system prompts
│   │   ├── orchestrator/
│   │   │   ├── VoiceSession.ts            # Manages voice session & streaming
│   │   │   └── interruptionTest.ts        # Test utilities
│   │   ├── routes/
│   │   │   ├── profileRoutes.ts           # Farmer profile & memory endpoints
│   │   │   └── voiceRoutes.ts             # /api/query, /api/interrupt, /api/history
│   │   ├── services/
│   │   │   ├── mandiPriceService.ts       # Live AGMARKNET data.gov.in price API
│   │   │   └── weatherService.ts          # Live Open-Meteo weather API
│   │   ├── stt/
│   │   │   └── SpeechToText.ts            # Groq Whisper Turbo STT integration
│   │   ├── tools/
│   │   │   └── farmTools.ts               # Tool definitions & execution
│   │   ├── utils/
│   │   │   └── latencyTracker.ts          # High-precision millisecond timing
│   │   ├── voice/
│   │   │   ├── RimeVoiceClient.ts         # Rime AI WebSocket client
│   │   │   └── languageDetector.ts        # Language code detection helper
│   │   └── server.ts                      # Express app entrypoint (Port 4000)
│   ├── .env                               # Backend environment secrets
│   └── package.json                       # Backend node configuration
│
└── frontend/
    ├── public/
    │   ├── ort/                           # Self-hosted ONNX Runtime Web static assets
    │   └── vad/                           # Self-hosted Silero VAD static assets
    ├── scripts/
    │   └── copy-vad-assets.js             # Automated static asset copier
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg                   # Krishak-G brand logo
    │   ├── components/
    │   │   ├── LandingPage.css            # Landing page styling
    │   │   ├── LandingPage.tsx            # Showcase website component
    │   │   ├── SplashScreen.css           # Splash animation styling
    │   │   └── SplashScreen.tsx           # Splash component
    │   ├── data/
    │   │   └── indiaLocations.json        # State & District cascading data
    │   ├── hooks/
    │   │   └── useHandsFreeSession.ts     # Silero VAD continuous listening hook
    │   ├── App.tsx                        # Main Voice Native OS React Container
    │   ├── index.css                      # Design system, glassmorphism & themes
    │   └── main.tsx                       # React DOM entrypoint
    ├── vite.config.ts                     # Vite bundler & optimizeDeps config
    └── package.json                       # Frontend react configuration
```

---

## 7. Tech Stack

- **Frontend**: React 19 (TypeScript), Vite 6, Custom Vanilla CSS.
- **Client-Side VAD**: `@ricky0123/vad-web` (Silero VAD v5 running in browser WebAssembly).
- **Backend Runtime**: Node.js, Express (TypeScript), Multer memory storage.
- **Database**: MongoDB with Mongoose ODM.
- **Speech-to-Text (STT)**: Groq Whisper Turbo (`whisper-large-v3-turbo`).
- **Language Model**: Groq Llama 3 70B (`llama-3.3-70b-versatile`).
- **Text-to-Speech (TTS)**: Rime AI WebSocket streaming (`coda` for Hindi, `astra` for English).
- **Live APIs**: Open-Meteo Weather API, data.gov.in AGMARKNET Mandi Price API.

---

## 8. API List

### REST Endpoints (`http://localhost:4000`)
1. `POST /api/query`: Accepts `audio` (multipart form), `sessionId`, `conversationId`, `languageHint`. Returns chunked MP3 audio stream with headers:
   - `X-Transcribed-Text`: Decoded STT transcription.
   - `X-Detected-Language`: `"hi"` or `"en"`.
   - `X-UI-Action`: Voice UI navigation intent (`SHOW_WEATHER`, `SHOW_MANDI`, `SHOW_SCHEMES`, `SHOW_ADVISORY`, `SHOW_PROFILE`, `SHOW_HISTORY`, `NEW_CHAT`, `SCROLL_DOWN`, `SCROLL_UP`, `GO_HOME`, `GO_BACK`).
2. `POST /api/interrupt`: Accepts `{ sessionId }`. Immediately aborts active LLM generation and clears Rime WebSocket audio queue.
3. `POST /api/profile`: Accepts farmer profile & memory parameters (`deviceId`, `name`, `location`, `state`, `district`, `preferredLanguage`, `mainCrop`, `landSizeAcres`, `previousCrop`).
4. `GET /api/profile/:deviceId`: Retrieves farmer profile and memory.
5. `GET /api/history/:deviceId`: Lists conversation summaries.
6. `GET /api/history/:deviceId/:conversationId`: Retrieves full turn-by-turn transcript for specific conversation.
7. `GET /health`: Healthcheck status (`{ status: "ok" }`).

---

## 9. Database Schema

### `farmerprofiles` Collection
- `deviceId`: String (Unique index, Required)
- `name`: String (Optional)
- `location`: String (Required, e.g. "Latur, Maharashtra")
- `country`: String (Default: "India")
- `state`: String
- `district`: String
- `preferredLanguage`: String (`"en"` | `"hi"`, Default: `"en"`)
- `mainCrop`: String (Optional)
- `landSizeAcres`: Number (Optional)
- `previousCrop`: String (Optional)
- `createdAt`: Date timestamp

### `conversationlogs` Collection
- `deviceId`: String (Required, Indexed)
- `conversationId`: String (Required, Indexed)
- `transcribedText`: String
- `responseText`: String
- `detectedLanguage`: String
- `responseLanguage`: String
- `createdAt`: Date timestamp

---

## 10. Voice Architecture

1. **VAD Triggering**: Client-side Silero VAD buffers microphone input and detects speech end after 700ms silence.
2. **STT Processing**: Groq Whisper Turbo transcribes audio buffer into text. Colloquial Hindi detected as Urdu (`"ur"`) is remapped to `"hi"` and normalized to Devanagari script.
3. **LLM & Tool Orchestration**: Llama 3 70B evaluates query against farmer memory, executes live tools (`get_weather`, `get_mandi_prices`), and outputs concise spoken text.
4. **Rime AI Streaming**: LLM output is streamed to Rime WebSocket (`wss://users-ws.rime.ai/ws3`). Base64 MP3 chunks are converted to binary and streamed to client.
5. **Speech Interruption**: When farmer speaks during TTS playback, frontend aborts fetch, stops audio, and dispatches `/api/interrupt`.

---

## 11. Rime Integration

- **Client Class**: [`RimeVoiceClient.ts`](file:///d:/krishak-g/backend/src/voice/RimeVoiceClient.ts)
- **Models**:
  - Hindi: `speaker: "nadi"`, `modelId: "coda"`, `lang: "hin"`
  - English: `speaker: "astra"`, `modelId: "coda"`, `lang: "eng"`
- **WebSocket Protocol**: Sends `{ text, contextId }`, receives binary base64 MP3 chunks. Clears queue via `{ operation: "clear" }` upon interruption.

---

## 12. UI Design System

- **Style**: Modern dark mode with subtle glassmorphic backdrop filters (`backdrop-filter: blur(12px)`).
- **Background**: `#0d1117` (Deep obsidian dark).
- **Containers & Cards**: `#161b22` with border `#30363d` and glass highlights.
- **Accents**:
  - Green (Primary/Success): `#22c55e` / `#4ade80`
  - Blue (Information/Weather): `#38bdf8` / `#60a5fa`
  - Purple (Schemes): `#c084fc`
  - Orange (Advisory): `#fb923c`
  - Red (Error/Recording): `#ef4444` / `#fca5a5`

---

## 13. Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Headings**: `800` weight for titles, `-0.03em` letter spacing.
- **Subtitles & Labels**: `500`/`600` weight, muted grey (`#8b949e` / `#a0aec0`).

---

## 14. Animation Rules

- **Microphone Active State**: Pulsing CSS radial keyframes (`mic-pulse`) during recording and speaking.
- **Card Expansion**: Smooth cubic-bezier transitions (`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Window Scrolling**: Smooth scrolling (`scroll-behavior: smooth`).

---

## 15. Accessibility Rules

- High contrast text (`#ffffff` on `#0d1117` / `#161b22`).
- Descriptive `aria-label` attributes on all microphone and interactive buttons.
- Full hands-free usability (touch is optional, voice is primary).

---

## 16. Component Library

1. `LandingPage`: Product overview, hero section, technical badges, feature cards, FAQ accordion, launch CTA.
2. `SplashScreen`: Initial animated branding loader.
3. `App` (Voice Native OS): Core state container managing VAD, audio playback, header intent actions, and dashboard widgets.
4. `WeatherCard`: Live temperature, humidity, rain probability, and location summary.
5. `MandiCard`: Live AGMARKNET commodity price items for Wheat, Soybean, Cotton.
6. `SchemesCard`: Active government agricultural schemes (PM-KISAN, PMFBY).
7. `AdvisoryCard`: Crop advisory, spray timing, and fertilizer recommendations.

---

## 17. Landing Page Specification

- Tagline: *"India's First Voice Native Agricultural Operating System"*
- Sections: Hero, Technical Badges (Rime AI & Silero VAD), How It Works (4 steps), Feature Cards (4 highlights), Interactive FAQ (5 items), Launch Dashboard CTA.

---

## 18. Dashboard Specification

- Header: Displays farmer district and state (`📍 Latur, Maharashtra`).
- Controls: "Start Hands-Free Session" button + Push-to-Talk holding button + Voice Status Label.
- Dynamic Visual Grid: Weather Card, Mandi Commodity Prices Card, Government Schemes Card, Crop Advisory Card.
- Auto-Scroll Engine: Voice commands scroll and highlight target cards automatically.

---

## 19. Memory Engine

- Stores persistent profile parameters (`deviceId`, `name`, `location`, `state`, `district`, `preferredLanguage`, `mainCrop`, `landSizeAcres`, `previousCrop`).
- Injects farmer memory directly into LLM system prompt in `VoiceSession.ts` so the assistant never repeatedly asks known information.

---

## 20. Voice Command Engine

```
"Show weather" / "मौसम"          ==>  X-UI-Action: SHOW_WEATHER  ==>  Scrolls to & expands Weather Card
"Open mandi" / "मंडी भाव"        ==>  X-UI-Action: SHOW_MANDI    ==>  Scrolls to & expands Mandi Card
"Government schemes" / "योजना"   ==>  X-UI-Action: SHOW_SCHEMES  ==>  Scrolls to & expands Schemes Card
"Crop advisory" / "सलाह"         ==>  X-UI-Action: SHOW_ADVISORY ==>  Scrolls to & expands Advisory Card
"Scroll down" / "नीचे"           ==>  X-UI-Action: SCROLL_DOWN   ==>  Window scrolls down 350px
"Scroll up" / "ऊपर"             ==>  X-UI-Action: SCROLL_UP     ==>  Window scrolls up 350px
"Show history" / "इतिहास"        ==>  X-UI-Action: SHOW_HISTORY  ==>  Opens conversation history view
"Go home" / "डैशबोर्ड"           ==>  X-UI-Action: GO_HOME       ==>  Navigates to main dashboard
"Go back" / "वापस"              ==>  X-UI-Action: GO_BACK       ==>  Returns to dashboard view
```

---

## 21. Supported Languages

- **Hindi (`hi`)**: Devanagari script responses, Rime `coda` voice synthesis, automatic remapping from Urdu script.
- **English (`en`)**: Natural English responses, Rime `astra` voice synthesis.

---

## 22. State Management

- Device ID: `localStorage.getItem("krishakg_device_id")`
- Conversation ID: `localStorage.getItem("krishakg_conversation_id")`
- View State: `"landing"` | `"dashboard"`
- Interaction State: `"idle"` | `"recording"` | `"thinking"` | `"speaking"`
- Active Card State: `"weather"` | `"mandi"` | `"schemes"` | `"advisory"` | `null`

---

## 23. Security Practices

- Secrets (`RIME_API_KEY`, `GROQ_API_KEY`, `MONGODB_URI`) stored exclusively in `backend/.env`.
- No raw API keys exposed to frontend client code.
- Input validation on all multipart audio streams and profile JSON endpoints.

---

## 24. Environment Variables

### Backend (`backend/.env`)
- `PORT`: `4000`
- `RIME_API_KEY`: Key for `wss://users-ws.rime.ai/ws3`
- `GROQ_API_KEY`: Key for Groq Whisper STT & Llama 3 70B LLM
- `MONGODB_URI`: MongoDB connection string

### Frontend (`frontend/.env`)
- `VITE_BACKEND_URL`: `http://localhost:4000`

---

## 25. Future Roadmap

1. **Offline PWA Caching**: Cache Silero VAD models and offline advisories.
2. **Multilingual Speech Expansion**: Support Marathi, Gujarati, Punjabi, and Telugu via Rime voices.
3. **Satellite Soil Moisture Integration**: Integrate real-time ISRO / Copernicus satellite imagery APIs.
