import path from "path";
import dotenv from "dotenv";
import { VoiceSession } from "./VoiceSession";
import { detectLanguage } from "../voice/languageDetector";

dotenv.config();

async function runMultilingualTest(): Promise<void> {
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

    // --- Query 1: English ---
    const englishQuery = "What is today's mandi price for wheat in Jaipur?";
    console.log(`[Query 1 - English]: "${englishQuery}"`);

    const englishResponse = await session.handleQuery("multi-en", englishQuery);
    const englishLang = detectLanguage(englishResponse);
    console.log(`Response: "${englishResponse}"`);
    console.log(
      `Detected Language: ${englishLang} -> Voice used: ${
        englishLang === "hi" ? "Hindi (nadi)" : "English (astra)"
      }\n`
    );

    console.log("Waiting for English audio stream to finish...");
    await session.waitForAudioCompletion("multi-en");

    const englishOutputPath = path.resolve(
      __dirname,
      "../../output/multilingual-english-response.mp3"
    );
    session.saveLastResponseAudio(englishOutputPath);
    console.log(`Saved English response audio to: ${englishOutputPath}\n`);

    // --- Query 2: Hindi ---
    const hindiQuery = "मेरे पास 20 लीटर का टैंक है, कितना पेस्टिसाइड डालूं?";
    console.log(`[Query 2 - Hindi]: "${hindiQuery}"`);

    const hindiResponse = await session.handleQuery("multi-hi", hindiQuery);
    const hindiLang = detectLanguage(hindiResponse);
    console.log(`Response: "${hindiResponse}"`);
    console.log(
      `Detected Language: ${hindiLang} -> Voice used: ${
        hindiLang === "hi" ? "Hindi (nadi)" : "English (astra)"
      }\n`
    );

    console.log("Waiting for Hindi audio stream to finish...");
    await session.waitForAudioCompletion("multi-hi");

    const hindiOutputPath = path.resolve(
      __dirname,
      "../../output/multilingual-hindi-response.mp3"
    );
    session.saveLastResponseAudio(hindiOutputPath);
    console.log(`Saved Hindi response audio to: ${hindiOutputPath}\n`);

    session.close();
    console.log("Multilingual test completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Multilingual test encountered an error:", error);
    session.close();
    process.exit(1);
  }
}

runMultilingualTest();
