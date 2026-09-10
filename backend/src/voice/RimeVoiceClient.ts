import { EventEmitter } from "events";
import WebSocket, { RawData } from "ws";

export interface AudioChunkPayload {
  data: string;
  contextId: string | null;
}

export class RimeVoiceClient extends EventEmitter {
  private speaker: string;
  private modelId: string;
  private apiKey: string;
  private lang: string;
  private ws: WebSocket | null = null;
  private connectingPromise: Promise<void> | null = null;
  public lastInterruptRequestedAt: number | null = null;
  private awaitingPostInterruptFirstChunk = false;
  private currentContextId: string | null = null;
  private hasReceivedFirstChunk = false;

  constructor(
    speaker: string,
    modelId: string,
    apiKey: string,
    lang: string = "eng"
  ) {
    super();
    this.speaker = speaker;
    this.modelId = modelId;
    this.apiKey = apiKey;
    this.lang = lang;
  }

  public getSpeaker(): string {
    return this.speaker;
  }

  public getModelId(): string {
    return this.modelId;
  }

  public getLang(): string {
    return this.lang;
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public async ensureConnected(maxRetries: number = 3): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      if (attempt === 1) {
        console.log(`[RIME] connecting model=${this.modelId} speaker=${this.speaker} lang=${this.lang}`);
      } else {
        console.log(`[RIME][${this.speaker}] reconnect attempt ${attempt - 1}`);
      }

      try {
        await this.connect();
        if (attempt > 1) {
          console.log(`[RIME][${this.speaker}] reconnect successful`);
        }
        return;
      } catch (err: any) {
        console.error(
          `[RIME][${this.speaker}] connection attempt ${attempt} failed:`,
          err?.message || String(err)
        );
        if (attempt >= maxRetries) {
          throw new Error(
            `[RIME][${this.speaker}] Failed to connect to Rime voice server after ${maxRetries} attempts: ${
              err?.message || String(err)
            }`
          );
        }
        // Short exponential backoff (250ms, 500ms)
        await new Promise((resolve) => setTimeout(resolve, attempt * 250));
      }
    }
  }

  public connect(): Promise<void> {
    if (this.isConnected()) {
      return Promise.resolve();
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = new Promise<void>((resolve, reject) => {
      const url = `wss://users-ws.rime.ai/ws3?speaker=${encodeURIComponent(
        this.speaker
      )}&modelId=${encodeURIComponent(
        this.modelId
      )}&lang=${encodeURIComponent(this.lang)}&audioFormat=mp3`;

      let socket: WebSocket;
      try {
        socket = new WebSocket(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        });
      } catch (err) {
        this.connectingPromise = null;
        return reject(err);
      }

      this.ws = socket;
      let hasOpened = false;

      socket.on("open", () => {
        hasOpened = true;
        this.connectingPromise = null;
        console.log(`[RIME] connected`);
        resolve();
      });

      socket.on("message", (data: RawData) => {
        try {
          const messageText = data.toString();
          const parsed = JSON.parse(messageText);

          const hasAudio = Boolean(parsed.data || parsed.audio || parsed.audioContent);
          const hasText = Boolean(parsed.text);
          console.log(
            `[RIME MESSAGE] message type=${parsed.type || "none"} audio field present=${hasAudio} contextId=${parsed.contextId || "none"}`
          );

          if (parsed.type === "error" || parsed.error) {
            const errMsg = parsed.error || parsed.message || "Unknown Rime WS Error";
            console.error(`[RIME] provider error=${errMsg}`);
            this.emit("error", new Error(`RIME_PROVIDER_ERROR: ${errMsg}`));
            return;
          }

          if (parsed.type === "chunk" || parsed.audio || parsed.data) {
            const base64Data: string =
              parsed.data || parsed.audio || parsed.audioContent || "";
            const decodedBuffer = Buffer.from(base64Data, "base64");
            const contextId: string | null = parsed.contextId ?? null;

            if (this.currentContextId === contextId && !this.hasReceivedFirstChunk) {
              this.hasReceivedFirstChunk = true;
              console.log(`[RIME] first audio chunk received bytes=${decodedBuffer.length}`);
            }

            if (
              this.awaitingPostInterruptFirstChunk &&
              this.lastInterruptRequestedAt !== null
            ) {
              const elapsed = performance.now() - this.lastInterruptRequestedAt;
              this.awaitingPostInterruptFirstChunk = false;
              this.emit("postInterruptFirstChunk", elapsed);
            }

            this.emit("chunk", { data: base64Data, contextId });
          } else if (
            parsed.type === "timestamps" ||
            parsed.type === "done" ||
            parsed.type === "end" ||
            parsed.done === true
          ) {
            const contextId: string | null = parsed.contextId ?? null;
            if (parsed.type === "done" || parsed.type === "end" || parsed.done === true) {
              console.log(`[RIME] done context=${contextId}`);
            }
            if (parsed.type === "timestamps") {
              this.emit("timestamps", parsed);
            }
            this.emit("done", { contextId });
          }
        } catch (err) {
          // Non-JSON payload
        }
      });

      socket.on("error", (error: Error) => {
        console.error(`[RIME SOCKET ERROR] speaker=${this.speaker}:`, error.message);
        if (!hasOpened) {
          this.connectingPromise = null;
          reject(error);
        }
        this.emit("error", error);
      });

      socket.on("close", (code: number, reason: Buffer) => {
        if (this.ws === socket) {
          this.ws = null;
        }
        this.connectingPromise = null;
        console.log(`[RIME] socket closed code=${code} reason=${reason.toString() || "none"}`);
        this.emit("close", { code, reason: reason.toString() });
      });
    });

    return this.connectingPromise;
  }

  public async speak(text: string, contextId: string): Promise<void> {
    await this.ensureConnected();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[RIME][${this.speaker}] WebSocket not open before speak, reconnecting once...`);
      await this.connect();
    }

    const isStateOpen = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    console.log(`[RIME WS] state before speak= ${isStateOpen ? "OPEN" : "CLOSED"}`);

    if (!isStateOpen || !this.ws) {
      throw new Error(
        `[RIME][${this.speaker}] Unable to speak: WebSocket connection is not open`
      );
    }

    console.log(`[RIME WS] speak started speaker=${this.speaker} context=${contextId}`);

    this.currentContextId = contextId;
    this.hasReceivedFirstChunk = false;
    console.log(`[RIME] sending text context=${contextId}`);

    const payload = JSON.stringify({
      text,
      contextId,
      flush: true
    });

    this.ws.send(payload);
  }

  public interrupt(): void {
    console.log(`[RIME][${this.speaker}] interrupt context=${this.lastInterruptRequestedAt}`);
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.lastInterruptRequestedAt = performance.now();
    this.awaitingPostInterruptFirstChunk = true;

    const payload = JSON.stringify({
      operation: "clear"
    });

    try {
      this.ws.send(payload);
    } catch (e) {
      // Ignore send error on closed socket during interrupt
    }
  }

  public close(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // Ignore close error
      }
      this.ws = null;
    }
    this.connectingPromise = null;
  }
}

