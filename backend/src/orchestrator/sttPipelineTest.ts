import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { transcribeAudioFile } from "../stt/SpeechToText";
import { VoiceSession } from "./VoiceSession";

dotenv.config();

async function runSttPipelineTest(): Promise<void> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const rimeApiKey = process.env.RIME_API_KEY;

  if (!groqApiKey || !rimeApiKey) {
    console.error(
      "Error: Both GROQ_API_KEY and RIME_API_KEY must be set in your .env file."
    );
    process.exit(1);
  }

  // Check test-assets path both relative to backend and workspace root
  const localAssetPath = path.resolve(__dirname, "../../test-assets/sample-query.mp3");
  const rootAssetPath = path.resolve(__dirname, "../../../test-assets/sample-query.mp3");

  let sampleAudioPath = localAssetPath;
  if (!fs.existsSync(sampleAudioPath)) {
    if (fs.existsSync(rootAssetPath)) {
      sampleAudioPath = rootAssetPath;
    } else {
      console.error(
        `\n[Error] Audio file not found at: ${localAssetPath}\n` +
          `Please place a sample audio recording at "backend/test-assets/sample-query.mp3" (or "test-assets/sample-query.mp3") to run this test.\n`
      );
      process.exit(1);
    }
  }

  try {
    console.log(`Transcribing audio file: ${sampleAudioPath}...`);
    const { text: transcribedText, detectedLanguage } = await transcribeAudioFile(sampleAudioPath, groqApiKey);
    console.log(`TRANSCRIBED TEXT: ${transcribedText} (Language: ${detectedLanguage})`);

    if (!transcribedText || transcribedText.trim().length === 0) {
      console.error("Error: Transcription returned empty text.");
      process.exit(1);
    }

    console.log("\nInitializing VoiceSession...");
    const session = new VoiceSession("astra", "mistv3", rimeApiKey, groqApiKey);
    await session.connect();
    console.log("VoiceSession connected.");

    console.log(`Processing transcribed query through VoiceSession...`);
    const responseText = await session.handleQuery("stt-test-1", transcribedText);
    console.log(`\n--- LLM Final Spoken Response ---\n${responseText}\n---------------------------------\n`);

    console.log("Waiting for audio streaming to complete...");
    await session.waitForAudioCompletion("stt-test-1");

    const outputFilePath = path.resolve(
      __dirname,
      "../../output/stt-pipeline-response.mp3"
    );
    session.saveLastResponseAudio(outputFilePath);
    console.log(`Audio successfully saved to: ${outputFilePath}`);

    session.close();
    process.exit(0);
  } catch (error) {
    console.error("STT Pipeline test failed with error:", error);
    process.exit(1);
  }
}

runSttPipelineTest();
