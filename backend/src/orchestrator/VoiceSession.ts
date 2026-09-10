import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { EventEmitter } from "events";
import { RimeVoiceClient, AudioChunkPayload } from "../voice/RimeVoiceClient";
import { LLMClient } from "../llm/LLMClient";
import { detectLanguage } from "../voice/languageDetector";

export class VoiceSession extends EventEmitter {
  private englishVoice: RimeVoiceClient;
  private hindiVoice: RimeVoiceClient;
  private activeVoice: RimeVoiceClient;
  private llmClient: LLMClient;
  private audioChunks: Buffer[] = [];
  public currentContextId: string | null = null;
  public lastSpokenResponse: string = "";
  private lastChunkTime: number = 0;
  private hasReceivedChunkForCurrentQuery: boolean = false;
  private isDoneEventReceived: boolean = false;
  private activeRequestId: string | null = null;
  private activeAbortController: AbortController | null = null;
  public lastInterruptAt: number | null = null;
  private lastResponseAudioBuffer: Buffer | null = null;
  private lastResponseLanguage: "en" | "hi" | null = null;
  private pendingClarificationQuery: string | null = null;

  constructor(
    speakerOrRimeApiKey: string,
    modelIdOrGroqApiKey: string,
    rimeApiKey?: string,
    groqApiKey?: string
  ) {
    super();
    const effectiveRimeKey = rimeApiKey ?? speakerOrRimeApiKey;
    const effectiveGroqKey = groqApiKey ?? modelIdOrGroqApiKey;

    this.englishVoice = new RimeVoiceClient(
      "astra",
      "coda",
      effectiveRimeKey,
      "eng"
    );
    this.hindiVoice = new RimeVoiceClient(
      "astra",
      "arcana",
      effectiveRimeKey,
      "hin"
    );
    this.activeVoice = this.englishVoice;
    this.llmClient = new LLMClient(effectiveGroqKey);

    this.setupVoiceListeners(this.englishVoice);
    this.setupVoiceListeners(this.hindiVoice);
  }

  private lastRimeError: Error | null = null;
  private isSocketClosedBeforeAudio: boolean = false;

  private setupVoiceListeners(voice: RimeVoiceClient): void {
    voice.on("chunk", (chunk: AudioChunkPayload) => {
      if (chunk.data) {
        const isAccepted = Boolean(this.currentContextId) && (!chunk.contextId || chunk.contextId === this.currentContextId);
        console.log(
          `[RIME CHUNK] queryId=${this.activeRequestId || "none"} contextId=${chunk.contextId || "none"} activeContextId=${this.currentContextId || "none"} ${isAccepted ? "ACCEPTED" : "REJECTED"}`
        );

        if (!isAccepted) {
          return;
        }

        const decoded = Buffer.from(chunk.data, "base64");
        if (!this.hasReceivedChunkForCurrentQuery) {
          console.log(`[RIME WS] first audio chunk bytes=${decoded.length}`);
          console.log("[RIME QUERY AUDIO] first chunk received");
        }
        this.audioChunks.push(decoded);
        this.lastChunkTime = Date.now();
        this.hasReceivedChunkForCurrentQuery = true;
        this.emit("audioChunk", { chunk: decoded, reqId: this.activeRequestId });
      }
    });

    voice.on("done", (payload: { contextId: string | null }) => {
      if (!payload.contextId || payload.contextId === this.currentContextId) {
        this.isDoneEventReceived = true;
      }
    });

    voice.on("close", () => {
      if (!this.hasReceivedChunkForCurrentQuery) {
        this.isSocketClosedBeforeAudio = true;
      }
    });

    voice.on("postInterruptFirstChunk", (latency: number) => {
      this.emit("postInterruptFirstChunk", latency);
    });

    voice.on("error", (error: Error) => {
      console.error(`[RIME QUERY AUDIO ERROR] voice=${voice.getSpeaker()}:`, error.message);
      this.lastRimeError = error;
      this.emit("error", error);
    });
  }

  public async connect(): Promise<void> {
    await Promise.all([
      this.englishVoice.ensureConnected(),
      this.hindiVoice.ensureConnected()
    ]);
  }

  public async ensureConnected(): Promise<void> {
    await Promise.all([
      this.englishVoice.ensureConnected(),
      this.hindiVoice.ensureConnected()
    ]);
  }

  public async handleQuery(
    requestId: string,
    text: string,
    languageHint?: string,
    defaultLocation?: string,
    onLLMResponseReady?: (responseText: string) => void
  ): Promise<string> {
    this.activeRequestId = requestId;

    console.log(`[VOICE QUERY] START queryId=${requestId}`);

    const controller = new AbortController();
    this.activeAbortController = controller;

    this.currentContextId = null;
    this.audioChunks = [];
    this.hasReceivedChunkForCurrentQuery = false;
    this.isDoneEventReceived = false;
    this.lastChunkTime = 0;
    this.lastRimeError = null;

    let responseText = "";
    let isClarifyingQuestion = false;

    // If there is a pending clarification from a previous turn,
    // pass it as context so the model treats this reply as the answer
    const pendingContext = this.pendingClarificationQuery;
    // Clear pending context before the call to avoid stacking more than one level
    this.pendingClarificationQuery = null;

    try {
      const llmResult = await this.llmClient.ask(
        text,
        controller.signal,
        languageHint,
        defaultLocation,
        pendingContext ?? undefined
      );
      responseText = llmResult.text;
      isClarifyingQuestion = llmResult.isClarifyingQuestion;
    } catch (err) {
      if (this.activeRequestId !== requestId) {
        console.log(`Discarded stale response for requestId: ${requestId}`);
        return "";
      }
      throw err;
    }

    if (this.activeRequestId !== requestId) {
      console.log(`Discarded stale response for requestId: ${requestId}`);
      return "";
    }

    console.log(`[VOICE QUERY] STT COMPLETE queryId=${requestId} transcript="${text}"`);
    console.log(`[VOICE QUERY] LLM COMPLETE queryId=${requestId}`);

    // If the LLM asked a clarifying question, store the original user query
    // so the next turn can be treated as the answer to that question
    if (isClarifyingQuestion) {
      this.pendingClarificationQuery = text;
      console.log(`[Clarification] LLM asked for more info. Stored pending query: "${text}"`);
    }

    if (onLLMResponseReady) {
      onLLMResponseReady(responseText);
    }
    this.emit("llmResponseReady", responseText);

    this.lastSpokenResponse = responseText;
    const contextId = uuidv4();
    this.currentContextId = contextId;

    const isHindi = languageHint === "hi" || detectLanguage(responseText) === "hi";
    const speaker = "astra";
    const modelId = isHindi ? "arcana" : "coda";
    const lang = isHindi ? "hin" : "eng";
    this.lastResponseLanguage = isHindi ? "hi" : "en";

    console.log(`[EMERGENCY RIME HTTP]\nrequest started\nlanguage=${lang}\nspeaker=${speaker}\nmodel=${modelId}\ntext length=${responseText.length}`);

    if (this.activeRequestId !== requestId) {
      console.log(`[VOICE QUERY] Discarded stale response before speaking for queryId=${requestId}`);
      return "";
    }

    try {
      const apiKey = process.env.RIME_API_KEY;
      const rimeResponse = await fetch("https://users.rime.ai/v1/rime-tts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "audio/wav"
        },
        body: JSON.stringify({
          speaker,
          modelId,
          text: responseText,
          lang
        }),
        signal: controller.signal
      });

      const contentType = rimeResponse.headers.get("content-type") || "audio/wav";
      console.log(`[RIME HTTP RESPONSE]\nstatus=${rimeResponse.status}\ncontent-type=${contentType}`);

      if (!rimeResponse.ok) {
        const errText = await rimeResponse.text();
        console.error(`[RIME HTTP ERROR] status=${rimeResponse.status} body=${errText}`);
        throw new Error(`RIME HTTP ERROR: ${rimeResponse.status}`);
      }

      const arrayBuffer = await rimeResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log(`[RIME HTTP RESPONSE]\nbytes=${buffer.length}`);

      if (buffer.length > 0) {
         this.lastResponseAudioBuffer = buffer;
         this.emit("audioChunk", { chunk: buffer, reqId: requestId });
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
         console.log(`[RIME HTTP] Request aborted for reqId=${requestId}`);
      } else {
         throw err;
      }
    }

    this.activeRequestId = null;
    return responseText;
  }

  public hasActiveTurn(): boolean {
    return this.activeRequestId !== null || this.currentContextId !== null || this.hasReceivedChunkForCurrentQuery;
  }

  public interrupt(): void {
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch (e) {
        // Ignore abort errors
      }
      this.activeAbortController = null;
    }
    this.currentContextId = null;
    this.activeRequestId = null;
    this.hasReceivedChunkForCurrentQuery = false;
    this.lastInterruptAt = Date.now();
    try {
      this.englishVoice.interrupt();
    } catch (e) {
      // Ignore interrupt errors
    }
    try {
      this.hindiVoice.interrupt();
    } catch (e) {
      // Ignore interrupt errors
    }
  }

  public async waitForAudioCompletion(
    requestId: string,
    firstChunkTimeoutMs = 15000,
    idleWaitMs = 10000,
    maxWaitMs = 35000
  ): Promise<Buffer> {
    // The HTTP fetch in handleQuery now blocks until complete, 
    // and emits the chunk synchronously. 
    // We just return the buffer immediately.
    return Promise.resolve(this.lastResponseAudioBuffer || Buffer.alloc(0));
  }

  public repeatLastResponse(): Buffer | null {
    return this.lastResponseAudioBuffer;
  }

  public getLastResponseLanguage(): "en" | "hi" | null {
    return this.lastResponseLanguage;
  }

  public saveLastResponseAudio(filePath: string): void {
    const resolvedPath = path.resolve(filePath);
    const directory = path.dirname(resolvedPath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const combinedBuffer = Buffer.concat(this.audioChunks);
    fs.writeFileSync(resolvedPath, combinedBuffer);
  }

  public close(): void {
    this.englishVoice.close();
    this.hindiVoice.close();
  }
}
