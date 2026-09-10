import { useState, useRef, useEffect, useCallback } from "react";
import { MicVAD, utils } from "@ricky0123/vad-web";

export function useHandsFreeSession(
  appState: "idle" | "listening" | "recording" | "thinking" | "speaking" | "interrupted",
  stopLocalPlayback: () => void,
  sendInterruptSignal: () => void,
  submitRecordedAudio: (audioBlob: Blob) => Promise<void>,
  setErrorMessage: (msg: string | null) => void
) {

  const [isSessionActive, setIsSessionActive] = useState(false);
  const vadRef = useRef<MicVAD | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const appStateRef = useRef(appState);
  const isInitializingRef = useRef(false);

  // Noise floor calibration & barge-in sustained tracking
  const noiseFloorRef = useRef<number>(0.005);
  const sustainedSpeechMsRef = useRef<number>(0);
  const hasInterruptedCurrentSegment = useRef(false);
  const currentSegmentPeakVolume = useRef(0);
  const lastLogTimeRef = useRef<number>(0);

  // Keep appState fresh in ref for VAD callbacks
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  const startSession = useCallback(async () => {
    if (isInitializingRef.current || vadRef.current) {
      console.log("[HandsFree] startSession ignored: initialization in progress or session active.");
      return;
    }

    isInitializingRef.current = true;
    try {
      setErrorMessage(null);

      // Clean up previous stream tracks if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Single microphone initialization call with hardware constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!isInitializingRef.current) {
        // Stop stream if session was aborted during getUserMedia call
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;

      // Reset adaptive noise floor & trackers on start
      noiseFloorRef.current = 0.005;
      sustainedSpeechMsRef.current = 0;
      hasInterruptedCurrentSegment.current = false;

      const vad = await MicVAD.new({
        getStream: async () => stream,
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/ort/",
        model: "v5",
        processorType: "auto",
        positiveSpeechThreshold: 0.70,
        negativeSpeechThreshold: 0.45,
        minSpeechMs: 500,
        preSpeechPadMs: 500,
        redemptionMs: 600,
        ortConfig: (ort) => {
          ort.env.wasm.wasmPaths = "/ort/";
          ort.env.wasm.numThreads = 1;
          ort.env.logLevel = "error";
        },
        onSpeechStart: () => {
          console.log("[VOICE] speech-start");
          currentSegmentPeakVolume.current = 0;
          sustainedSpeechMsRef.current = 0;
          hasInterruptedCurrentSegment.current = false;
        },
        onFrameProcessed: (probs: any, frame: Float32Array) => {
          let sumSq = 0;
          let maxVol = 0;
          for (let i = 0; i < frame.length; i++) {
            const abs = Math.abs(frame[i]);
            sumSq += abs * abs;
            if (abs > maxVol) maxVol = abs;
          }
          const rms = Math.sqrt(sumSq / (frame.length || 1));
          if (maxVol > currentSegmentPeakVolume.current) {
            currentSegmentPeakVolume.current = maxVol;
          }

          // Frame duration in ms (typically ~30ms per 512-sample frame at 16kHz)
          const frameMs = (frame.length / 16000) * 1000 || 32;

          // Adapt noise floor during quiet periods when not speaking
          const isQuietProb = (probs.isSpeech ?? 0) < 0.30;
          if (isQuietProb && appStateRef.current !== "speaking") {
            const clampedRms = Math.min(Math.max(rms, 0.001), 0.05);
            noiseFloorRef.current = 0.95 * noiseFloorRef.current + 0.05 * clampedRms;
          }

          const prob = probs.isSpeech ?? 0;
          const currentNoiseFloor = noiseFloorRef.current;
          const isSpeechProbHigh = prob >= 0.68;
          const isEnergyAboveNoise = rms > Math.max(currentNoiseFloor * 2.5, 0.012) && maxVol > 0.03;
          const isCandidate = isSpeechProbHigh && isEnergyAboveNoise;

          if (isCandidate) {
            sustainedSpeechMsRef.current += frameMs;
          } else {
            sustainedSpeechMsRef.current = Math.max(0, sustainedSpeechMsRef.current - frameMs * 1.5);
          }

          const now = Date.now();
          const currentState = appStateRef.current;

          // Check for valid barge-in during assistant speaking or thinking
          if (
            (currentState === "speaking" || currentState === "thinking") &&
            !hasInterruptedCurrentSegment.current
          ) {
            if (sustainedSpeechMsRef.current >= 240) {
              hasInterruptedCurrentSegment.current = true;
              console.log(
                `[VAD] prob=${prob.toFixed(2)} rms=${rms.toFixed(3)} peak=${maxVol.toFixed(
                  3
                )} noiseFloor=${currentNoiseFloor.toFixed(
                  3
                )} speechDuration=${Math.round(
                  sustainedSpeechMsRef.current
                )}ms state=${currentState} decision=INTERRUPT`
              );
              stopLocalPlayback();
              sendInterruptSignal();
            } else if (isCandidate && now - lastLogTimeRef.current >= 300) {
              lastLogTimeRef.current = now;
              console.log(
                `[VAD] prob=${prob.toFixed(2)} rms=${rms.toFixed(3)} peak=${maxVol.toFixed(
                  3
                )} noiseFloor=${currentNoiseFloor.toFixed(
                  3
                )} speechDuration=${Math.round(
                  sustainedSpeechMsRef.current
                )}ms state=${currentState} decision=IGNORE_NOISE`
              );
            }
          }
        },
        onSpeechEnd: (audio: Float32Array) => {
          console.log("[VOICE] speech-end, audio samples:", audio.length);
          sustainedSpeechMsRef.current = 0;
          hasInterruptedCurrentSegment.current = false;

          if (audio.length < 3200) {
            console.log("[VOICE] Speech segment too short, discarding.");
            return;
          }

          // Convert Float32Array to WAV Blob
          const wavBuffer = utils.encodeWAV(audio);
          const blob = new Blob([wavBuffer], { type: "audio/wav" });
          console.log(`[VOICE] audio WAV generated, size: ${blob.size} bytes`);

          submitRecordedAudio(blob).catch((err) =>
            console.error("[VOICE] Failed to submit VAD audio", err)
          );
        }
      });

      if (!isInitializingRef.current) {
        // Destroy VAD and stream if session was aborted during VAD creation
        await vad.destroy();
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        return;
      }

      await vad.start();
      vadRef.current = vad;
      setIsSessionActive(true);
      console.log("[VOICE] MicVAD initialized with adaptive noise floor and barge-in gate.");
    } catch (err: any) {
      console.error("Failed to start hands-free session:", err);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setErrorMessage(
          "Microphone permission denied. Please allow microphone access to speak."
        );
      } else {
        setErrorMessage(
          "Could not start hands-free session: " +
            (err.message || "Unknown error")
        );
      }
      setIsSessionActive(false);
    } finally {
      isInitializingRef.current = false;
    }
  }, [
    stopLocalPlayback,
    sendInterruptSignal,
    submitRecordedAudio,
    setErrorMessage
  ]);

  const stopSession = useCallback(async () => {
    isInitializingRef.current = false;
    if (vadRef.current) {
      try {
        await vadRef.current.pause();
        await vadRef.current.destroy();
      } catch (e) {
        console.warn("[HandsFree] Error destroying VAD:", e);
      }
      vadRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("[HandsFree] Error stopping stream tracks:", e);
      }
      streamRef.current = null;
    }
    setIsSessionActive(false);
    console.log("[VOICE] Hands-free session stopped cleanly.");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return { isSessionActive, startSession, stopSession };
}

