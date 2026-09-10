import path from "path";
import dotenv from "dotenv";
import { VoiceSession } from "./VoiceSession";

dotenv.config();

async function runSessionTest(): Promise<void> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const rimeApiKey = process.env.RIME_API_KEY;

  if (!groqApiKey || !rimeApiKey) {
    console.error(
      "Error: Both GROQ_API_KEY and RIME_API_KEY must be set in your .env file."
    );
    process.exit(1);
  }

  const session = new VoiceSession("astra", "mistv3", rimeApiKey, groqApiKey);

  try {
    console.log("Connecting voice session to Rime WebSocket...");
    await session.connect();
    console.log("Voice session connected.");

    const query = "I have a 15 litre tank, how much pesticide should I add?";
    console.log(`User query: "${query}"`);

    const textResponse = await session.handleQuery("test-1", query);
    console.log("\n--- LLM Final Spoken Response ---");
    console.log(textResponse);
    console.log("---------------------------------\n");

    console.log("Receiving and streaming audio chunks...");
    await session.waitForAudioCompletion("test-1");

    const outputFilePath = path.resolve(__dirname, "../../output/test-response.mp3");
    session.saveLastResponseAudio(outputFilePath);
    console.log(`Audio successfully saved to: ${outputFilePath}`);

    session.close();
    process.exit(0);
  } catch (error) {
    console.error("Session test encountered an error:", error);
    session.close();
    process.exit(1);
  }
}

runSessionTest();
