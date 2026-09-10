import crypto from "crypto";
import dotenv from "dotenv";
import { RimeVoiceClient, AudioChunkPayload } from "./RimeVoiceClient";

dotenv.config();

async function runVoiceEngineTest(): Promise<void> {
  const apiKey = process.env.RIME_API_KEY;

  if (!apiKey) {
    console.error("Error: RIME_API_KEY is not defined in .env");
    process.exit(1);
  }

  const englishClient = new RimeVoiceClient("astra", "coda", apiKey, "eng");
  const hindiClient = new RimeVoiceClient("astra", "arcana", apiKey, "hin");

  const clients = [
    { client: englishClient, name: "English (coda)", text: "This is a test of the English production voice model." },
    { client: hindiClient, name: "Hindi (arcana)", text: "नमस्ते! यह हिंदी उत्पादन ध्वनि मॉडल का परीक्षण है।" }
  ];

  for (const { client, name, text } of clients) {
    console.log(`\n--- Testing ${name} ---`);
    let doneReceived = false;

    client.on("chunk", (chunk: AudioChunkPayload) => {
      const byteSize = Buffer.from(chunk.data, "base64").byteLength;
      console.log(`[${name}] chunk: ${byteSize} bytes | contextId: ${chunk.contextId}`);
    });

    client.on("done", () => {
      console.log(`[${name}] done event received.`);
      doneReceived = true;
    });

    client.on("error", (error: Error) => {
      console.error(`[${name}] WebSocket error:`, error.message);
    });

    try {
      console.log(`[${name}] Connecting...`);
      await client.connect();
      console.log(`[${name}] Connected.`);

      const contextId = crypto.randomUUID();
      console.log(`[${name}] Calling speak() with contextId ${contextId}...`);
      await client.speak(text, contextId);

      // Wait for done event
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout waiting for done")), 10000);
        const checkInterval = setInterval(() => {
          if (doneReceived) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      console.log(`[${name}] Test completed successfully.`);
      client.close();

    } catch (error) {
      console.error(`[${name}] Test failed:`, error);
      client.close();
      process.exit(1);
    }
  }
  
  console.log("\nAll production configs tested successfully.");
  process.exit(0);
}

runVoiceEngineTest();
