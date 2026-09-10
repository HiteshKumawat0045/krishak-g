import path from "path";
import dotenv from "dotenv";
import { VoiceSession } from "./VoiceSession";

dotenv.config();

async function runInterruptionTest(): Promise<void> {
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
    console.log("Voice session connected.\n");

    // 1. Send first query without awaiting
    const firstQueryPromise = session.handleQuery(
      "req-1",
      "I have a 20 litre tank, how much pesticide should I add if I'm using Confidor?"
    );
    console.log("STEP A: First query sent (pesticide dosage)");

    // 2. Wait exactly 800ms then interrupt
    await new Promise((resolve) => setTimeout(resolve, 800));
    session.interrupt();
    console.log("STEP B: Interrupt triggered at +800ms");

    // 3. Immediately send second query and await completion
    console.log("STEP C: Second query sent (mandi price)");
    const secondQueryResponse = await session.handleQuery(
      "req-2",
      "Actually, ignore that. What is today's mandi price for wheat in Jaipur?"
    );

    // Wait for previous promise to settle in background
    await firstQueryPromise.catch(() => {});

    // 4. Wait for the second query audio streaming to complete
    await session.waitForAudioCompletion("req-2");

    const previewWords = secondQueryResponse.split(" ").slice(0, 8).join(" ");
    console.log(
      `STEP D: Final spoken response was about: ${previewWords}...`
    );
    console.log(`\nFull Spoken Response: "${secondQueryResponse}"\n`);

    // 5. Save final audio
    const outputFilePath = path.resolve(
      __dirname,
      "../../output/interruption-test-response.mp3"
    );
    session.saveLastResponseAudio(outputFilePath);
    console.log(`Audio successfully saved to: ${outputFilePath}`);

    session.close();
    process.exit(0);
  } catch (error) {
    console.error("Interruption test encountered an error:", error);
    session.close();
    process.exit(1);
  }
}

runInterruptionTest();
