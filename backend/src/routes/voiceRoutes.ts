import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { VoiceSession } from "../orchestrator/VoiceSession";
import { transcribeAudioFile } from "../stt/SpeechToText";
import { FarmerProfile } from "../db/models/FarmerProfile";
import { ConversationLog } from "../db/models/ConversationLog";
import { LatencyTracker } from "../utils/latencyTracker";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const sessions = new Map<string, VoiceSession>();

function isRepeatPhrase(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[.,?!।]/g, "");

  const repeatPhrases = [
    "repeat",
    "say again",
    "repeat that",
    "repeat please",
    "say that again",
    "can you repeat",
    "दोहराओ",
    "फिर से बोलो",
    "दोबारा बोलो",
    "फिर से बताइए",
    "दोबारा बताइए",
    "एक बार फिर बोलो"
  ];

  return repeatPhrases.some(
    (phrase) =>
      normalized === phrase ||
      normalized.startsWith(phrase) ||
      normalized.includes(phrase)
  );
}

function detectUIAction(text: string): string | null {
  const norm = text.toLowerCase().trim();
  
  if (norm.includes("briefing") || norm.includes("summary") || norm.includes("बुलेटिन") || norm.includes("ब्रीफिंग") || norm.includes("आज का हाल") || norm.includes("overview")) {
    return "SHOW_BRIEFING";
  }
  if (norm.includes("weather") || norm.includes("मौसम") || norm.includes("rain") || norm.includes("बारिश") || norm.includes("temperature") || norm.includes("तापमान")) {
    return "SHOW_WEATHER";
  }
  if (norm.includes("mandi") || norm.includes("भाव") || norm.includes("दाम") || norm.includes("price") || norm.includes("market") || norm.includes("मंडी") || norm.includes("rate") || norm.includes("दर")) {
    return "SHOW_MANDI";
  }
  if (norm.includes("scheme") || norm.includes("yojana") || norm.includes("योजना") || norm.includes("subsidy") || norm.includes("सरकारी") || norm.includes("pm-kisan") || norm.includes("पीएम किसान")) {
    return "SHOW_SCHEMES";
  }
  if (norm.includes("crop") || norm.includes("fertilizer") || norm.includes("खाद") || norm.includes("सलाह") || norm.includes("advisory") || norm.includes("disease") || norm.includes("फसल") || norm.includes("कीड़ा") || norm.includes("बीमारी")) {
    return "SHOW_ADVISORY";
  }
  if (norm.includes("profile") || norm.includes("प्रोफाइल") || norm.includes("edit profile")) {
    return "SHOW_PROFILE";
  }
  if (norm.includes("history") || norm.includes("इतिहास") || norm.includes("पुरानी बातचीत")) {
    return "SHOW_HISTORY";
  }
  if (norm.includes("new chat") || norm.includes("नया चैट") || norm.includes("reset chat")) {
    return "NEW_CHAT";
  }
  if (norm.includes("scroll down") || norm.includes("next") || norm.includes("नीचे करो") || norm.includes("नीचे जाइए") || norm.includes("आगे")) {
    return "SCROLL_DOWN";
  }
  if (norm.includes("scroll up") || norm.includes("previous") || norm.includes("ऊपर करो") || norm.includes("ऊपर जाइए") || norm.includes("पीछे")) {
    return "SCROLL_UP";
  }
  if (norm.includes("home") || norm.includes("dashboard") || norm.includes("होम") || norm.includes("डैशबोर्ड")) {
    return "GO_HOME";
  }
  if (norm.includes("back") || norm.includes("गो बैक") || norm.includes("वापस")) {
    return "GO_BACK";
  }
  return null;
}


function writeLatencyLog(sessionId: string, tracker: LatencyTracker): void {
  const logFilePath = path.resolve(__dirname, "../../output/latency-log.jsonl");
  console.log("Writing latency log to:", logFilePath);

  try {
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const report = tracker.getReport();
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionId,
      marks: [...report],
      totalMs: report.totalMs
    });
    fs.appendFileSync(logFilePath, logEntry + "\n");
    console.log(`Latency log written to: ${logFilePath}`);
  } catch (error) {
    console.error("LATENCY LOG WRITE FAILED:", error);
  }
}

router.post(
  "/query",
  upload.single("audio"),
  async (req: Request, res: Response): Promise<void> => {
    const latencyTracker = new LatencyTracker();
    latencyTracker.mark("audio_received");

    const sessionId = req.body?.sessionId;
    const conversationId =
      typeof req.body?.conversationId === "string" && req.body.conversationId.trim()
        ? req.body.conversationId.trim()
        : undefined;
    const languageHint =
      typeof req.body?.languageHint === "string" && req.body.languageHint.trim()
        ? req.body.languageHint.trim()
        : typeof req.body?.language === "string" && req.body.language.trim()
        ? req.body.language.trim()
        : (req.headers["x-language"] as string) || undefined;


    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: "audio file is required" });
      return;
    }

    console.log(`Received audio: mimetype=${req.file.mimetype}, size=${req.file.size} bytes`);

    const rimeApiKey = process.env.RIME_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!rimeApiKey || !groqApiKey) {
      res.status(500).json({
        error: "Server configuration error: missing API keys in environment"
      });
      return;
    }

    let session = sessions.get(sessionId);
    if (!session) {
      session = new VoiceSession("astra", "mistv3", rimeApiKey, groqApiKey);
      try {
        await session.connect();
        sessions.set(sessionId, session);
      } catch (err: any) {
        console.error("Failed to connect VoiceSession:", err);
        res.status(500).json({
          error:
            "Failed to initialize voice session: " +
            (err.message || String(err))
        });
        return;
      }
    } else {
      try {
        await session.ensureConnected();
      } catch (err: any) {
        console.warn("[VoiceRoutes] Existing session connection lost, recreating VoiceSession...", err?.message || String(err));
        try {
          session.close();
        } catch (e) {}
        session = new VoiceSession("astra", "mistv3", rimeApiKey, groqApiKey);
        try {
          await session.connect();
          sessions.set(sessionId, session);
        } catch (reconnectErr: any) {
          console.error("Failed to reconnect VoiceSession:", reconnectErr);
          res.status(500).json({
            error: "Failed to reconnect voice session: " + (reconnectErr.message || String(reconnectErr))
          });
          return;
        }
      }
    }

    console.log(`[RIME LIFECYCLE] beforeInterrupt session=${sessionId}`);
    if (session.hasActiveTurn()) {
      console.log(`[RIME LIFECYCLE] interruptSent active turn detected for session ${sessionId}, sending interrupt`);
      session.interrupt();
    } else {
      console.log(`[RIME LIFECYCLE] no active turn for session ${sessionId}, skipping interrupt`);
    }

    console.log(`[RIME LIFECYCLE] connectStarted session=${sessionId}`);
    await session.ensureConnected();
    console.log(`[RIME LIFECYCLE] socketOpened session=${sessionId}`);

    try {


      // Look up FarmerProfile by sessionId (deviceId) early for language fallback
      let profile = null;
      let defaultLocation: string | undefined = undefined;

      try {
        profile = await FarmerProfile.findOne({
          deviceId: sessionId.trim()
        });
        if (profile) {
          const locPart = profile.location || (profile.district && profile.state ? `${profile.district}, ${profile.state}` : profile.district || profile.state || "");
          const parts = [];
          if (profile.name) parts.push(`Name: ${profile.name}`);
          if (locPart) parts.push(`Location: ${locPart}`);
          if (profile.mainCrop) parts.push(`Crop: ${profile.mainCrop}`);
          if (profile.landSizeAcres) parts.push(`Land Size: ${profile.landSizeAcres} acres`);
          if (profile.preferredLanguage) parts.push(`Preferred Language: ${profile.preferredLanguage}`);
          defaultLocation = parts.join(", ");
        }
      } catch (err) {
        console.error("Profile lookup error in query route:", err);
      }

      const { text: transcribedText, detectedLanguage } = await transcribeAudioFile(
        req.file.buffer,
        groqApiKey,
        languageHint || profile?.preferredLanguage || "en",
        req.file.mimetype || req.file.originalname
      );

      latencyTracker.mark("transcription_done");
      console.log(`STT OUTPUT: ${transcribedText} (Language: ${detectedLanguage})`);

      if (!transcribedText || !transcribedText.trim()) {
        res.status(400).json({ error: "Could not transcribe audio input" });
        return;
      }

      let effectiveLanguageHint = languageHint;
      if (!effectiveLanguageHint) {
        if (detectedLanguage !== "unknown") {
          effectiveLanguageHint = detectedLanguage;
        } else {
          effectiveLanguageHint = profile?.preferredLanguage || "en";
        }
      }

      // Check if user requested repetition
      if (isRepeatPhrase(transcribedText)) {
        const cachedAudio = session.repeatLastResponse();

        if (cachedAudio && cachedAudio.length > 0) {
          console.log(
            `[Repeat] Replaying cached audio response for sessionId: ${sessionId}`
          );
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Length", cachedAudio.length);
          res.setHeader(
            "X-Transcribed-Text",
            encodeURIComponent(transcribedText.trim())
          );
          res.setHeader("Access-Control-Expose-Headers", "X-Transcribed-Text");
          res.end(cachedAudio);
          return;
        }

        // If no prior audio exists, generate a short polite spoken response
        const isHindi =
          effectiveLanguageHint === "hi" ||
          /[\u0900-\u097F]/.test(transcribedText);
        const fallbackText = isHindi
          ? "नमस्ते किसान भाई, मैंने अभी कोई जानकारी नहीं दी है। आप बेझिझक अपना सवाल पूछें।"
          : "Hello! I haven't shared any information yet. Please feel free to ask your farming question.";

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Transfer-Encoding", "chunked");
        res.setHeader(
          "X-Transcribed-Text",
          encodeURIComponent(transcribedText.trim())
        );
        res.setHeader("X-Detected-Language", encodeURIComponent(detectedLanguage));
        res.setHeader("Access-Control-Expose-Headers", "X-Transcribed-Text, X-Detected-Language");

        let firstChunkSent = false;
        let totalServerAudioBytes = 0;
        let serverChunkCount = 0;
        const requestId = uuidv4();
        const onAudioChunk = (payload: { chunk: Buffer, reqId: string }) => {
          if (payload.reqId !== requestId) return;
          const chunk = payload.chunk;
          serverChunkCount++;
          totalServerAudioBytes += chunk.length;
          if (!firstChunkSent) {
            firstChunkSent = true;
            latencyTracker.mark("first_audio_chunk_sent");
            console.log(`[AUDIO SERVER] first chunk sent: ${chunk.length} bytes`);
          }
          if (!res.writableEnded) {
            res.write(chunk);
          }
        };

        session.on("audioChunk", onAudioChunk);
        const cleanup = () => {
          session?.off("audioChunk", onAudioChunk);
        };
        req.on("close", cleanup);

        await session.handleQuery(
          requestId,
          fallbackText,
          effectiveLanguageHint,
          defaultLocation,
          () => {
            latencyTracker.mark("llm_response_ready");
          }
        );
        await session.waitForAudioCompletion(requestId);
        cleanup();

        console.log(`[AUDIO SERVER] fallback response ending, chunks=${serverChunkCount}, bytes=${totalServerAudioBytes}`);
        if (!res.writableEnded) {
          res.end();
        }
        console.log("LATENCY:", latencyTracker.getReport());
        writeLatencyLog(sessionId, latencyTracker);
        return;
      }

      const action = detectUIAction(transcribedText);

      let firstChunkSent = false;
      let totalServerAudioBytes = 0;
      let serverChunkCount = 0;
      let listenerAttached = false;
      let listenerRemoved = false;
      const requestId = uuidv4();

      const onAudioChunk = (payload: { chunk: Buffer, reqId: string }) => {
        if (payload.reqId !== requestId) return;
        const chunk = payload.chunk;
        serverChunkCount++;
        totalServerAudioBytes += chunk.length;
        if (!firstChunkSent) {
          firstChunkSent = true;
          let contentType = "audio/mpeg";
          if (chunk.length >= 4 && chunk.toString("ascii", 0, 4) === "RIFF") {
            contentType = "audio/wav";
          }
          res.setHeader("Content-Type", contentType);
          res.setHeader("Transfer-Encoding", "chunked");
          res.setHeader("X-Transcribed-Text", encodeURIComponent(transcribedText.trim()));
          res.setHeader("X-Detected-Language", encodeURIComponent(detectedLanguage));
          if (action) {
            res.setHeader("X-UI-Action", action);
          }
          if (llmResponseText) {
            res.setHeader("X-Response-Text", encodeURIComponent(llmResponseText));
          }
          res.setHeader("Access-Control-Expose-Headers", "X-Transcribed-Text, X-Detected-Language, X-UI-Action, X-Response-Text");
          
          latencyTracker.mark("first_audio_chunk_sent");
          console.log(`[RIME-AUDIO] first chunk: ${chunk.length} bytes, type: ${contentType}`);
        }
        if (!res.writableEnded) {
          res.write(chunk);
        }
      };

      session.on("audioChunk", onAudioChunk);
      listenerAttached = true;
      console.log(`[AUDIO LISTENER] attached=true (listenerAttached=${listenerAttached})`);

      const cleanup = () => {
        if (session && listenerAttached && !listenerRemoved) {
          session.off("audioChunk", onAudioChunk);
          listenerRemoved = true;
          console.log(`[AUDIO LISTENER] removed=true (listenerRemoved=${listenerRemoved})`);
        }
      };

      req.on("close", cleanup);

      let llmResponseText = "";
      const responseText = await session.handleQuery(
        requestId,
        transcribedText,
        effectiveLanguageHint,
        defaultLocation,
        (text: string) => {
          llmResponseText = text;
          latencyTracker.mark("llm_response_ready");
          // Headers are deferred until first audio chunk arrives
        }
      );

      llmResponseText = llmResponseText || responseText;
      await session.waitForAudioCompletion(requestId);

      cleanup();

      console.log(`[RIME-AUDIO] chunk count: ${serverChunkCount}`);
      console.log(`[RIME-AUDIO] total bytes: ${totalServerAudioBytes}`);
      console.log(`[RIME-AUDIO] completed`);

      if (totalServerAudioBytes === 0) {
        console.error("[RIME-AUDIO] ERROR: Rime returned no audio (0 bytes)");
        if (!res.headersSent) {
          res.status(500).json({ error: "Rime returned no audio" });
          return;
        }
      }

      console.log(`[VOICE QUERY] HTTP AUDIO SENT totalBytes=${totalServerAudioBytes}`);
      if (!res.writableEnded) {
        res.end();
      }

      console.log("LATENCY:", latencyTracker.getReport());
      writeLatencyLog(sessionId, latencyTracker);

      // Fire-and-forget save of conversation log
      if (conversationId && llmResponseText) {
        const responseLanguage = session.getLastResponseLanguage() || effectiveLanguageHint || "en";
        ConversationLog.create({
          deviceId: sessionId,
          conversationId,
          transcribedText,
          detectedLanguage,
          responseText: llmResponseText,
          responseLanguage
        }).catch((err) => {
          console.error("Failed to save conversation log:", err);
        });
      }
    } catch (error: any) {
      console.error("Query handling error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to process query: " + (error.message || String(error))
        });
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  }
);

router.post("/repeat", async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.body?.sessionId;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    res
      .status(404)
      .json({ error: "No active voice session found for the provided sessionId" });
    return;
  }

  const cachedAudio = session.repeatLastResponse();
  if (cachedAudio && cachedAudio.length > 0) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", cachedAudio.length);
    res.end(cachedAudio);
    return;
  }

  const lastLang = session.getLastResponseLanguage() || "en";
  const fallbackMessage =
    lastLang === "hi"
      ? "मैंने अभी तक कोई जानकारी नहीं दी है।"
      : "I have not said anything yet.";

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");

  const requestId = uuidv4();
  const onAudioChunk = (payload: { chunk: Buffer, reqId: string }) => {
    if (payload.reqId !== requestId) return;
    const chunk = payload.chunk;
    if (!res.writableEnded) {
      res.write(chunk);
    }
  };

  session.on("audioChunk", onAudioChunk);
  const cleanup = () => {
    session.off("audioChunk", onAudioChunk);
  };
  req.on("close", cleanup);

  try {
    await session.handleQuery(requestId, fallbackMessage, lastLang);
    await session.waitForAudioCompletion(requestId);
    cleanup();
    if (!res.writableEnded) {
      res.end();
    }
  } catch (err: any) {
    cleanup();
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Failed to generate repeat fallback audio" });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

router.post("/interrupt", (req: Request, res: Response): void => {
  const sessionId = req.body?.sessionId;

  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    res
      .status(404)
      .json({ error: "No active voice session found for the provided sessionId" });
    return;
  }

  session.interrupt();
  res.json({ status: "interrupted" });
});

// History endpoints for conversation transcript retrieval
router.get(
  "/history/:deviceId",
  async (req: Request, res: Response): Promise<void> => {
    const deviceId = req.params.deviceId as string;

    if (!deviceId || !deviceId.trim()) {
      res.status(400).json({ error: "deviceId is required" });
      return;
    }

    try {
      const conversations = await ConversationLog.aggregate([
        { $match: { deviceId: deviceId.trim() } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$conversationId",
            startedAt: { $first: "$createdAt" },
            preview: { $first: "$transcribedText" }
          }
        },
        { $sort: { startedAt: -1 } }
      ]);

      const result = conversations.map((c: any) => ({
        conversationId: c._id,
        startedAt: c.startedAt,
        preview:
          c.preview.length > 60
            ? c.preview.substring(0, 60) + "..."
            : c.preview
      }));

      res.json(result);
    } catch (err) {
      console.error("History list fetch error:", err);
      res.status(500).json({ error: "Failed to fetch conversation history" });
    }
  }
);

router.get(
  "/history/:deviceId/:conversationId",
  async (req: Request, res: Response): Promise<void> => {
    const deviceId = req.params.deviceId as string;
    const conversationId = req.params.conversationId as string;

    if (!deviceId || !conversationId) {
      res.status(400).json({ error: "deviceId and conversationId are required" });
      return;
    }

    try {
      const turns = await ConversationLog.find(
        {
          deviceId: deviceId.trim(),
          conversationId: conversationId.trim()
        },
        {
          transcribedText: 1,
          responseText: 1,
          detectedLanguage: 1,
          responseLanguage: 1,
          createdAt: 1,
          _id: 0
        }
      ).sort({ createdAt: 1 });

      res.json(turns);
    } catch (err) {
      console.error("History detail fetch error:", err);
      res.status(500).json({ error: "Failed to fetch conversation details" });
    }
  }
);

router.get("/test-rime-audio", (_req: Request, res: Response): void => {
  const mp3Path = path.resolve(__dirname, "../../test-assets/sample-query.mp3");
  if (fs.existsSync(mp3Path)) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", fs.statSync(mp3Path).size);
    console.log(`[RIME-AUDIO] Serving test sample-query.mp3 (${fs.statSync(mp3Path).size} bytes)`);
    fs.createReadStream(mp3Path).pipe(res);
  } else {
    console.error("[RIME-AUDIO] Test sample-query.mp3 not found at path:", mp3Path);
    res.status(404).json({ error: "Test Rime audio file not found" });
  }
});

export default router;
