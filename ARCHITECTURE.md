# Krishak-G Architecture & Technical Blueprint

## 1. Executive Overview & System Philosophy

**Krishak-G** is an ultra-fast, voice-native agricultural operating system engineered specifically for Indian farmers. It provides an intuitive, hands-free conversational interface in Hindi and English, delivering real-time mandi prices, localized weather forecasts, government scheme information, and crop disease advisory without requiring keyboard input.

### Core Architectural Principles
* **Voice-Native First:** Speech is the primary interaction model. Text and visual dashboards act as progressive enhancements.
* **Low Latency Pipeline:** Sub-second response streaming utilizing Groq Whisper for Speech-to-Text (STT), Groq LLaMA-3 70B for reasoning/tool calling, and Rime TTS for natural Hindi/English voice output.
* **Hands-Free Active VAD:** Client-side Voice Activity Detection using Silero VAD (`@ricky0123/vad-web`) enables continuous, hands-free speech sensing and automatic interruption handling.
* **Context & Memory Engine:** Device-bound profiles (`FarmerProfile`) combined with thread-based persistent history (`ConversationLog`) provide hyper-localized answers based on state, district, crop type, and historical queries.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Client [Frontend - React 19 + Vite]
        UI[App Dashboard & UI]
        VAD[Silero VAD - @ricky0123/vad-web]
        Mic[Audio Recorder / Stream]
        AudioPlayer[HTML5 Audio / Web Audio API]
    end

    subgraph Server [Backend - Node.js Express + TS]
        Router[Express Router /api]
        VoiceRoute[/api/query & /api/interrupt]
        ProfileRoute[/api/profile]
        Orchestrator[VoiceSession Orchestrator]
        STTService[Groq Whisper STT]
        LLMService[Groq LLM + Tool Call Engine]
        RimeService[Rime TTS Voice Engine]
        WeatherSvc[OpenWeather API]
        MandiSvc[Data.gov.in Agmarknet API]
    end

    subgraph Data [Persistence Layer]
        MongoDB[(MongoDB Database)]
    end

    Mic -->|Audio Blob| Router
    VAD -->|Interruption Event| VoiceRoute
    Router --> Orchestrator
    Orchestrator -->|Raw Audio| STTService
    STTService -->|Transcribed Text| Orchestrator
    Orchestrator -->|Text + Context| LLMService
    LLMService -->|Fetch Weather/Mandi| WeatherSvc
    LLMService -->|Fetch Market Rates| MandiSvc
    LLMService -->|LLM Text Response| RimeService
    RimeService -->|Streaming PCM/WAV Audio| Orchestrator
    Orchestrator -->|Audio Buffer + Headers| Router
    Router -->|WAV Response + UI Action| AudioPlayer
    ProfileRoute <--> MongoDB
    VoiceRoute <--> MongoDB
```

---

## 3. Technology Stack Matrix

| Component | Layer | Technology | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | Client | React 19, TypeScript, Vite 6 | Fast, lightweight UI rendering and responsive layout |
| **Client VAD** | Client | `@ricky0123/vad-web`, ONNX Runtime | Browser-side WebAssembly Voice Activity Detection |
| **Backend Server** | Server | Node.js, Express, TypeScript, `tsx` | RESTful API server and streaming orchestrator |
| **Database** | Database | MongoDB, Mongoose ODM | Localized profile storage and conversation logs |
| **Speech-To-Text** | Service | Groq Whisper (`whisper-large-v3-turbo`) | High-speed multilingual audio transcription |
| **LLM Reasoning** | Service | Groq LLaMA 3.3 70B Versatile | Intent detection, tool execution, and response synthesis |
| **Text-To-Speech** | Service | Rime TTS (`nadi` Hindi, `astra` English) | Streaming voice response generation |
| **Weather Data** | Third-Party | OpenWeather API | 5-day forecasts, temperature, rain, wind condition |
| **Market Rates** | Third-Party | Data.gov.in Agmarknet API | Mandi commodity prices across Indian districts |

---

## 4. Subsystem Specifications

### 4.1 Frontend Architecture (`frontend/src/`)
* **`App.tsx`**: Main application state controller handling screen navigation (`landing` vs `dashboard`), active card views (`weather`, `mandi`, `schemes`, `advisory`), push-to-talk audio recording, hands-free VAD session management, profile modal, and conversation history view.
* **`components/LandingPage.tsx`**: High-converting, feature-highlighting landing page explaining system capabilities and FAQs.
* **`components/SplashScreen.tsx`**: Animated brand onboarding splash screen with audio permission initialization.
* **`hooks/useHandsFreeSession.ts`**: Encapsulates Silero VAD lifecycle. Tracks microphone streams, speech detection thresholds (`positiveSpeechThreshold: 0.8`), speech padding, and sends immediate interrupt signals to `/api/interrupt` when the farmer speaks during audio playback.
* **`scripts/copy-vad-assets.js`**: Post-install script copying ONNX runtime files (`.wasm`, `.mjs`) to `public/ort/` and Silero VAD models to `public/vad/`.

### 4.2 Backend Architecture (`backend/src/`)
* **`server.ts`**: Express application entrypoint configured with CORS headers (`X-Transcribed-Text`, `X-Detected-Language`, `X-UI-Action`), health check routes, and MongoDB database connection startup.
* **`routes/voiceRoutes.ts`**: Core API handler for `/api/query`, `/api/interrupt`, `/api/repeat`, `/api/history`, and `/api/conversations`. Accepts multipart audio uploads, coordinates transcription, handles repeat phrase overrides, triggers UI action detection, and returns streaming audio binaries.
* **`routes/profileRoutes.ts`**: Manages farmer profile retrieval and upserts (`/api/profile`, `/api/profile/:deviceId`).
* **`orchestrator/VoiceSession.ts`**: Manages concurrent English and Hindi voice clients (`RimeVoiceClient`). Handles active request abort controllers, context ID tracking, audio chunk assembly, and interruption cleanup.
* **`llm/LLMClient.ts`**: Interacts with Groq SDK. Formats system instructions, executes function calling tools (`get_weather`, `get_mandi_price`), and returns concise, spoken-optimized responses.
* **`stt/SpeechToText.ts`**: Transcribes uploaded audio buffers via Groq Whisper API with language hint detection.
* **`tools/farmTools.ts`**: Defines Groq function call schemas for weather and mandi price lookups.
* **`services/weatherService.ts`**: Fetches and parses OpenWeather current and forecast metrics.
* **`services/mandiPriceService.ts`**: Queries Agmarknet data or returns fallback market benchmarks per crop and district.

---

## 5. Voice Pipeline & Interaction Flow

```
[Farmer Speaks] 
       │
       ▼
[Silero VAD / PTT] -> Generates Audio Blob
       │
       ▼
[POST /api/query] -> Multipart Form (Audio + Session ID + Profile Context)
       │
       ├─► [Groq Whisper STT] -> Transcribes Audio to Text & Detects Language
       │
       ├─► [Repeat Check / UI Action Resolver] -> Determines if UI state changes
       │
       ├─► [Groq LLM + Tools] -> Executes weather/mandi tools if required
       │
       ├─► [Rime TTS] -> Synthesizes PCM/WAV speech (Hindi: nadi, English: astra)
       │
       ▼
[Audio Stream Returned to Frontend] -> Played via HTML5 Audio + Transcribed Text Displayed
```

### Interruption Mechanism
If the farmer speaks while the assistant is narrating:
1. Client-side `useHandsFreeSession` detects speech start (`onSpeechStart`).
2. Stops local audio element playback instantly.
3. Sends `POST /api/interrupt` with active `sessionId`.
4. Backend `VoiceSession.ts` aborts ongoing LLM/TTS operations via `AbortController` and clears audio queues.

---

## 6. Database Models (`backend/src/db/models/`)

### `FarmerProfile` Schema
```typescript
{
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  country: { type: String, default: "India" },
  state: { type: String, required: true },
  district: { type: String, required: true },
  location: { type: String, required: true },
  preferredLanguage: { type: String, enum: ["en", "hi"], default: "en" },
  mainCrop: { type: String },
  landSizeAcres: { type: Number },
  previousCrop: { type: String },
  createdAt: Date,
  updatedAt: Date
}
```

### `ConversationLog` Schema
```typescript
{
  conversationId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true, index: true },
  transcribedText: { type: String, required: true },
  responseText: { type: String, required: true },
  detectedLanguage: { type: String, default: "en" },
  responseLanguage: { type: String, default: "en" },
  uiAction: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 7. API Reference Catalog

| Endpoint | Method | Input Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | GET | None | `{ status: "ok" }` | Backend health check |
| `/api/query` | POST | `multipart/form-data` (`audio`, `sessionId`, `conversationId`, `languageHint`, `deviceId`) | `audio/wav` binary + Headers (`X-Transcribed-Text`, `X-Detected-Language`, `X-UI-Action`) | Primary speech processing pipeline |
| `/api/interrupt` | POST | `{ sessionId: string }` | `{ success: true }` | Immediately cancels active speech generation |
| `/api/repeat` | POST | `{ sessionId: string }` | `audio/wav` binary | Re-synthesizes and returns last spoken response |
| `/api/conversations/:deviceId` | GET | URL param: `deviceId` | `[ { conversationId, startedAt, preview } ]` | Lists conversation history threads |
| `/api/conversations/:conversationId/turns` | GET | URL param: `conversationId` | `[ { transcribedText, responseText, createdAt } ]` | Fetches turns for a conversation thread |
| `/api/profile` | POST | `{ deviceId, location, state, district, name, preferredLanguage }` | Updated `FarmerProfile` JSON | Upserts farmer profile |
| `/api/profile/:deviceId` | GET | URL param: `deviceId` | `FarmerProfile` JSON | Retrieves stored profile by device ID |

---

## 8. Directory & File Inventory

```
d:\krishak-g\
├── ARCHITECTURE.md                  # Permanent System Architecture Document (This File)
├── frontend\
│   ├── package.json                 # Frontend dependencies (React 19, Vite 6, @ricky0123/vad-web)
│   ├── vite.config.ts               # Vite bundler config with onnxruntime-web alias & optimizeDeps
│   ├── tsconfig.json                # TypeScript frontend compiler configuration
│   ├── .env                         # VITE_BACKEND_URL configuration
│   ├── scripts/
│   │   └── copy-vad-assets.js       # Copies WASM and ONNX runtime files to public directory
│   └── src/
│       ├── App.tsx                  # Main React dashboard & audio interaction state
│       ├── index.css                # Global styles, glassmorphism UI, animation rules
│       ├── components/
│       │   ├── LandingPage.tsx      # Promotional hero landing page
│       │   ├── LandingPage.css      # Landing page styles
│       │   ├── SplashScreen.tsx     # Startup logo splash screen
│       │   └── SplashScreen.css    # Splash screen styles
│       ├── hooks/
│       │   └── useHandsFreeSession.ts # Silero VAD audio stream & interruption hook
│       └── data/
│           └── indiaLocations.json  # Comprehensive Indian state & district hierarchy dataset
└── backend\
    ├── package.json                 # Backend dependencies (Express, Groq, Mongoose, Multer)
    ├── tsconfig.json                # TypeScript backend compiler configuration
    ├── .env                         # API keys (Rime, Groq, OpenWeather, Data.gov.in) & PORT
    └── src/
        ├── server.ts                # Express application server entry point
        ├── db/
        │   ├── connectDB.ts         # MongoDB connection lifecycle manager
        │   └── models/
        │       ├── FarmerProfile.ts   # Mongoose model for farmer profiles
        │       └── ConversationLog.ts # Mongoose model for persistent audio turns
        ├── llm/
        │   └── LLMClient.ts         # Groq LLM integration & system prompt formatting
        ├── orchestrator/
        │   └── VoiceSession.ts      # Multi-voice streaming session coordinator
        ├── routes/
        │   ├── voiceRoutes.ts       # Audio query, interrupt, repeat, and history handlers
        │   └── profileRoutes.ts     # Farmer profile CRUD endpoints
        ├── services/
        │   ├── weatherService.ts    # OpenWeather REST client
        │   ├── mandiPriceService.ts # Agmarknet market price client
        │   └── realDataTest.ts      # Integration test script for live APIs
        ├── stt/
        │   └── SpeechToText.ts      # Groq Whisper transcription module
        ├── tools/
        │   └── farmTools.ts         # Function call schemas for LLM tool calling
        ├── utils/
        │   └── latencyTracker.ts    # Pipeline timing marker utility
        └── voice/
            ├── RimeVoiceClient.ts   # WebSockets / REST Rime voice TTS client
            ├── languageDetector.ts  # Hindi vs English language classification helper
            ├── listHindiVoices.ts   # Rime voice discovery utility script
            └── voiceEngineTest.ts   # Rime voice generation test runner
```
