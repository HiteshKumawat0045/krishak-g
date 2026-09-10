import fs from "fs";
import Groq, { toFile } from "groq-sdk";

export async function transcribeAudioFile(
  audioSource: string | Buffer,
  apiKey: string,
  languageHint?: string,
  filenameOrMime?: string
): Promise<{ text: string; detectedLanguage: string }> {
  const groq = new Groq({ apiKey });

  let file: any;
  if (typeof audioSource === "string") {
    if (!fs.existsSync(audioSource)) {
      throw new Error(`Audio file not found at: ${audioSource}`);
    }
    file = fs.createReadStream(audioSource);
  } else {
    let filename = "user-recording.wav";
    if (filenameOrMime) {
      const lower = filenameOrMime.toLowerCase();
      if (lower.includes("webm")) {
        filename = "user-recording.webm";
      } else if (lower.includes("mp4") || lower.includes("m4a")) {
        filename = "user-recording.m4a";
      } else if (lower.includes("mp3")) {
        filename = "user-recording.mp3";
      } else if (lower.includes("ogg")) {
        filename = "user-recording.ogg";
      } else if (lower.includes("wav")) {
        filename = "user-recording.wav";
      }
    }
    file = await toFile(audioSource, filename);
  }

  const transcriptionOptions: Parameters<
    typeof groq.audio.transcriptions.create
  >[0] = {
    file,
    model: "whisper-large-v3-turbo",
    response_format: "verbose_json"
  };

  if (languageHint) {
    transcriptionOptions.language = languageHint === "hi" ? "hi" : "en";
  }

  const transcription = (await groq.audio.transcriptions.create(
    transcriptionOptions
  )) as any;

  let detectedLanguage = "unknown";
  if (transcription.language) {
    const lang = transcription.language.toLowerCase();
    if (lang === "hi" || lang === "hindi" || lang === "ur" || lang === "urdu") {
      detectedLanguage = "hi";
    } else if (lang === "en" || lang === "english") {
      detectedLanguage = "en";
    }
  }

  const text = transcription.text.trim();
  // Arabic/Urdu Unicode block (0600-06FF)
  const persoArabicRegex = /[\u0600-\u06FF]/;
  if (persoArabicRegex.test(text)) {
    detectedLanguage = "hi";
  }

  return { 
    text, 
    detectedLanguage 
  };
}
