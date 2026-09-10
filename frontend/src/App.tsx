import React, { useState, useRef, useEffect, useCallback } from "react";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import ProfileScreen, { ProfileData } from "./components/ProfileScreen";
import Footer from "./components/Footer";
import FarmBriefingWidget, { FarmBriefingData } from "./components/FarmBriefingWidget";
import { useHandsFreeSession } from "./hooks/useHandsFreeSession";
import { getTranslation, LanguageCode } from "./data/translations";




type InteractionState = "idle" | "listening" | "recording" | "thinking" | "speaking" | "interrupted";


interface ConversationSummary {
  conversationId: string;
  startedAt: string;
  preview: string;
}

interface ConversationTurn {
  transcribedText: string;
  responseText: string;
  detectedLanguage: string;
  responseLanguage: string;
  createdAt: string;
}

interface GovtScheme {
  id: string;
  name: string;
  category: string;
  benefit: string;
  description: string;
  eligibility: string;
  portalUrl: string;
  updatedAt: string;
}

interface CropAdvisoryData {
  cropName: string;
  season: string;
  stage: string;
  fertilizerRecommendation: string;
  pestWarning: string;
  actionRequired: string;
  source: string;
  updatedAt: string;
}

interface RealMandiItem {
  cropName: string;
  location: string;
  pricePerQuintal: number;
  market: string;
  date: string;
}

interface RealWeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainExpected: boolean;
  advisory: string;
}

interface DashboardDataState {
  location: string;
  weather: RealWeatherData | null;
  weatherError: string | null;
  weatherTimestamp: string;
  mandiPrices: RealMandiItem[];
  mandiError: string | null;
  mandiTimestamp: string;
  schemes: GovtScheme[];
  schemesTimestamp: string;
  advisory: CropAdvisoryData | null;
  advisoryTimestamp: string;
  loading: boolean;
}


function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("krishakg_device_id");
  if (!id) {
    try {
      id = crypto.randomUUID();
    } catch {
      id = "device-" + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem("krishakg_device_id", id);
  }
  return id;
}

function getOrCreateConversationId(): string {
  let id = localStorage.getItem("krishakg_conversation_id");
  if (!id) {
    try {
      id = crypto.randomUUID();
    } catch {
      id = "conv-" + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem("krishakg_conversation_id", id);
  }
  return id;
}

export default function App() {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Persistent device ID for this device / browser
  const deviceIdRef = useRef<string>(getOrCreateDeviceId());

  // Landing Page State
  const hasSeenLanding = localStorage.getItem("krishakg_landing_seen");
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">(
    hasSeenLanding === "true" ? "dashboard" : "landing"
  );

  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Profile Onboarding State
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(
    () => localStorage.getItem("krishakg_profile_complete") === "true"
  );
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);

  const [profileData, setProfileData] = useState<ProfileData>(() => ({
    profileName: localStorage.getItem("krishakg_profile_name") || "",
    profileCountry: "India",
    profileState: localStorage.getItem("krishakg_profile_state") || "",
    profileDistrict: localStorage.getItem("krishakg_profile_district") || "",
    profileLanguage: (localStorage.getItem("krishakg_language") as LanguageCode) || "en",
    profileCrop: localStorage.getItem("krishakg_profile_crop") || "Wheat (गेहूँ)",
    profileFarmSize: localStorage.getItem("krishakg_profile_farm_size") || "Small (2 - 5 Acres)",
    notifyWeather: localStorage.getItem("krishakg_notify_weather") !== "false",
    notifyMandi: localStorage.getItem("krishakg_notify_mandi") !== "false",
    notifyAdvisory: localStorage.getItem("krishakg_notify_advisory") !== "false",
    voiceSpeed: (localStorage.getItem("krishakg_voice_speed") as any) || "normal",
    autoStartHandsFree: localStorage.getItem("krishakg_auto_start_handsfree") === "true",
    interruptSensitivity: (localStorage.getItem("krishakg_interrupt_sensitivity") as any) || "high"
  }));

  const handleProfileChange = useCallback((updated: Partial<ProfileData>) => {
    setProfileData((prev) => {
      const next = { ...prev, ...updated };
      if (updated.profileName !== undefined) localStorage.setItem("krishakg_profile_name", next.profileName);
      if (updated.profileState !== undefined) localStorage.setItem("krishakg_profile_state", next.profileState);
      if (updated.profileDistrict !== undefined) localStorage.setItem("krishakg_profile_district", next.profileDistrict);
      if (updated.profileLanguage !== undefined) localStorage.setItem("krishakg_language", next.profileLanguage);
      if (updated.profileCrop !== undefined) localStorage.setItem("krishakg_profile_crop", next.profileCrop);
      if (updated.profileFarmSize !== undefined) localStorage.setItem("krishakg_profile_farm_size", next.profileFarmSize);
      if (updated.notifyWeather !== undefined) localStorage.setItem("krishakg_notify_weather", String(next.notifyWeather));
      if (updated.notifyMandi !== undefined) localStorage.setItem("krishakg_notify_mandi", String(next.notifyMandi));
      if (updated.notifyAdvisory !== undefined) localStorage.setItem("krishakg_notify_advisory", String(next.notifyAdvisory));
      if (updated.voiceSpeed !== undefined) localStorage.setItem("krishakg_voice_speed", next.voiceSpeed);
      if (updated.autoStartHandsFree !== undefined) localStorage.setItem("krishakg_auto_start_handsfree", String(next.autoStartHandsFree));
      if (updated.interruptSensitivity !== undefined) localStorage.setItem("krishakg_interrupt_sensitivity", next.interruptSensitivity);

      fetch(`${backendUrl}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceIdRef.current,
          name: next.profileName,
          state: next.profileState,
          district: next.profileDistrict,
          location: `${next.profileDistrict}, ${next.profileState}`,
          preferredLanguage: next.profileLanguage,
          crop: next.profileCrop,
          farmSize: next.profileFarmSize,
          notifications: {
            weather: next.notifyWeather,
            mandi: next.notifyMandi,
            advisory: next.notifyAdvisory
          },
          voiceSettings: {
            speed: next.voiceSpeed,
            autoStart: next.autoStartHandsFree,
            sensitivity: next.interruptSensitivity
          }
        })
      }).catch((e) => console.warn("Backend profile auto-sync notice:", e));

      return next;
    });
  }, [backendUrl]);

  const profileState = profileData.profileState;
  const profileDistrict = profileData.profileDistrict;
  const profileLanguage = profileData.profileLanguage;
  const setProfileLanguage = useCallback((lang: LanguageCode) => {
    handleProfileChange({ profileLanguage: lang });
  }, [handleProfileChange]);

  const t = getTranslation(profileLanguage);

  // Persistent conversation ID for this chat thread
  const [conversationId, setConversationId] = useState<string>(
    getOrCreateConversationId
  );

  // History Screen State
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [viewingConversationId, setViewingConversationId] = useState<string | null>(null);
  const [viewingTurns, setViewingTurns] = useState<ConversationTurn[]>([]);
  const [turnsLoading, setTurnsLoading] = useState<boolean>(false);

  const [state, setState] = useState<InteractionState>("idle");
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  const [activeCard, setActiveCard] = useState<"briefing" | "weather" | "mandi" | "schemes" | "advisory" | null>("briefing");

  // Farm Briefing State
  const [farmBriefing, setFarmBriefing] = useState<FarmBriefingData | null>(null);
  const [briefingLoading, setBriefingLoading] = useState<boolean>(true);

  // Telemetry Debug State
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);
  const [telemetryLog, setTelemetryLog] = useState<{
    turnId: number;
    appState: string;
    transcribedText: string;
    detectedLanguage: string;
    sttLatencyMs: number;
    llmLatencyMs: number;
    rimeFirstChunkMs: number;
    timeToFirstPlaybackMs: number;
    totalTurnLatencyMs: number;
    interrupted: boolean;
  } | null>(null);

  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    location: "",
    weather: null,
    weatherError: null,
    weatherTimestamp: "",
    mandiPrices: [],
    mandiError: null,
    mandiTimestamp: "",
    schemes: [],
    schemesTimestamp: "",
    advisory: null,
    advisoryTimestamp: "",
    loading: true
  });

  const fetchDashboardData = useCallback(async (loc?: string) => {
    setDashboardData((prev) => ({ ...prev, loading: true }));
    const targetLoc = loc || (profileDistrict && profileState ? `${profileDistrict}, ${profileState}` : "Delhi, India");
    try {
      const res = await fetch(`${backendUrl}/api/dashboard-data?location=${encodeURIComponent(targetLoc)}&deviceId=${deviceIdRef.current}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData({
          location: data.location || targetLoc,
          weather: data.weather || null,
          weatherError: data.weatherError || null,
          weatherTimestamp: data.weatherTimestamp ? new Date(data.weatherTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          mandiPrices: data.mandiPrices || [],
          mandiError: data.mandiError || null,
          mandiTimestamp: data.mandiTimestamp ? new Date(data.mandiTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          schemes: data.schemes || [],
          schemesTimestamp: data.schemesTimestamp ? new Date(data.schemesTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          advisory: data.advisory || null,
          advisoryTimestamp: data.advisoryTimestamp ? new Date(data.advisoryTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          loading: false
        });
      } else {
        setDashboardData((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  }, [backendUrl, profileDistrict, profileState]);

  const fetchBriefingData = useCallback(async (loc?: string) => {
    setBriefingLoading(true);
    const targetLoc = loc || (profileDistrict && profileState ? `${profileDistrict}, ${profileState}` : "Delhi, India");
    try {
      const res = await fetch(`${backendUrl}/api/farm-briefing?location=${encodeURIComponent(targetLoc)}&deviceId=${deviceIdRef.current}`);
      if (res.ok) {
        const data = await res.json();
        setFarmBriefing(data);
      }
    } catch (err) {
      console.error("Failed to fetch farm briefing:", err);
    } finally {
      setBriefingLoading(false);
    }
  }, [backendUrl, profileDistrict, profileState]);

  useEffect(() => {
    if (isProfileComplete && currentView === "dashboard") {
      fetchDashboardData();
      fetchBriefingData();
    }
  }, [isProfileComplete, currentView, profileDistrict, profileState, fetchDashboardData, fetchBriefingData]);

  // Conversation Turns Feed State
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const chatFeedRef = useRef<HTMLDivElement | null>(null);
  const turnsEndRef = useRef<HTMLDivElement | null>(null);


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);

  const stopLocalPlayback = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }
    if (currentObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      } catch (e) {}
      currentObjectUrlRef.current = null;
    }
  }, []);

  const initAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.autoplay = false;
      audio.volume = 1.0;
      audio.muted = false;

      audio.onloadedmetadata = () => console.log("[AUDIO] loadedmetadata");
      audio.onloadeddata = () => console.log("[AUDIO] loadeddata");
      audio.oncanplay = () => console.log("[AUDIO] canplay");
      audio.onplaying = () => {
        console.log("[AUDIO] playing");
        console.log("[AUDIO] readyState=", audio.readyState);
        console.log("[AUDIO] networkState=", audio.networkState);
        console.log("[AUDIO] paused=", audio.paused);
        console.log("[AUDIO] muted=", audio.muted);
        console.log("[AUDIO] volume=", audio.volume);
        console.log("[AUDIO] currentTime=", audio.currentTime);
        setState("speaking");
      };
      audio.onpause = () => console.log("[AUDIO] pause");
      audio.onended = () => {
        console.log("[AUDIO] ended");
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
        setState((prev) => (prev === "speaking" ? "idle" : prev));
      };
      audio.onerror = () => {
        console.error(
          `[AUDIO] error code=${audio.error?.code || "none"} message=${
            audio.error?.message || "none"
          }`
        );
        if (currentObjectUrlRef.current) {
          URL.revokeObjectURL(currentObjectUrlRef.current);
          currentObjectUrlRef.current = null;
        }
        setState((prev) => (prev === "speaking" ? "idle" : prev));
      };

      audioRef.current = audio;
      console.log("[AUDIO] Persistent HTMLAudioElement initialized.");
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    initAudioElement();
  }, [initAudioElement]);

  // Auto-scroll conversation feed to latest turn smoothly
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationTurns, state, transcribedText]);

  // Load active conversation turns on conversationId change
  const loadActiveConversationTurns = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/history/${deviceIdRef.current}/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setConversationTurns(data || []);
      }
    } catch (err) {
      console.error("Failed to load active conversation turns:", err);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (isProfileComplete && conversationId) {
      loadActiveConversationTurns(conversationId);
    }
  }, [conversationId, isProfileComplete, loadActiveConversationTurns]);

  // Prime browser audio player during user gesture to comply with Chrome Autoplay Policy
  const primeAudioPlayer = useCallback(() => {
    const audio = initAudioElement();
    if (audio) {
      audio.volume = 1.0;
      audio.muted = false;
    }
  }, [initAudioElement]);

  // Fetch initial profile if already completed to sync preferred language & profile state
  useEffect(() => {
    if (isProfileComplete) {
      fetch(`${backendUrl}/api/profile/${deviceIdRef.current}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            handleProfileChange({
              profileName: data.name || profileData.profileName,
              profileState: data.state || profileData.profileState,
              profileDistrict: data.district || profileData.profileDistrict,
              profileLanguage: (data.preferredLanguage as LanguageCode) || profileData.profileLanguage,
              profileCrop: data.crop || profileData.profileCrop,
              profileFarmSize: data.farmSize || profileData.profileFarmSize,
              notifyWeather: data.notifications?.weather ?? profileData.notifyWeather,
              notifyMandi: data.notifications?.mandi ?? profileData.notifyMandi,
              notifyAdvisory: data.notifications?.advisory ?? profileData.notifyAdvisory,
              voiceSpeed: data.voiceSettings?.speed || profileData.voiceSpeed,
              autoStartHandsFree: data.voiceSettings?.autoStart ?? profileData.autoStartHandsFree,
              interruptSensitivity: data.voiceSettings?.sensitivity || profileData.interruptSensitivity
            });
          }
        })
        .catch(() => {});
    }
  }, [isProfileComplete, backendUrl, handleProfileChange]);

  // Cleanup audio tracks on unmount
  useEffect(() => {
    return () => {
      stopLocalPlayback();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopLocalPlayback]);

  const handleEditProfile = useCallback(() => {
    stopLocalPlayback();
    setShowProfileEditor(true);
  }, [stopLocalPlayback]);

  const sendInterruptSignal = async () => {
    try {
      const currentId = ++requestIdRef.current;
      setState("interrupted");
      setTelemetryLog((prev) => prev ? {
        ...prev,
        appState: "interrupted",
        interrupted: true
      } : {
        turnId: currentId,
        appState: "interrupted",
        transcribedText: "User Interrupted",
        detectedLanguage: "en",
        sttLatencyMs: 0,
        llmLatencyMs: 0,
        rimeFirstChunkMs: 0,
        timeToFirstPlaybackMs: 0,
        totalTurnLatencyMs: 0,
        interrupted: true
      });
      stopLocalPlayback();
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
        activeAbortControllerRef.current = null;
      }
      await fetch(`${backendUrl}/api/interrupt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: deviceIdRef.current })
      });
    } catch {
      // Ignore interrupt network errors
    }
  };

  const startRecording = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    primeAudioPlayer();

    if (isHoldingRef.current) return;
    isHoldingRef.current = true;
    setErrorMessage(null);

    // If speaking or thinking, interrupt previous turn immediately
    if (state === "speaking" || state === "thinking") {
      stopLocalPlayback();
      sendInterruptSignal();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        submitRecordedAudio(mimeType);
      };

      mediaRecorder.start();
      setState("recording");
    } catch (err: any) {
      isHoldingRef.current = false;
      setState("idle");
      console.error("Microphone access error:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setErrorMessage(
          "Microphone permission denied. Please allow microphone access to speak."
        );
      } else {
        setErrorMessage(
          "Could not access microphone: " + (err.message || "Unknown error")
        );
      }
    }
  };

  const stopRecording = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      setState("thinking");
      mediaRecorderRef.current.stop();
    }
  };

  const handleTestRimeVoice = async () => {
    console.log("[AUDIO TEST] 🔊 Test Rime Voice clicked");
    const audio = initAudioElement();
    if (audio) {
      audio.volume = 1.0;
      audio.muted = false;
    }
    const currentReqId = ++requestIdRef.current;
    setState("thinking");

    try {
      const response = await fetch(`${backendUrl}/api/test-rime-audio`);
      console.log(`[AUDIO] response status = ${response.status}`);
      console.log(`[AUDIO] content-type = ${response.headers.get("content-type")}`);

      if (!response.ok) {
        throw new Error(`Test Rime endpoint failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (requestIdRef.current !== currentReqId) return;
          if (value && value.length > 0) {
            chunks.push(value);
            totalBytes += value.length;
          }
          if (done) break;
        }
      }

      console.log(`[AUDIO] chunks = ${chunks.length}`);
      console.log(`[AUDIO] totalBytes = ${totalBytes}`);

      const blob = new Blob(chunks as any[], { type: "audio/mpeg" });
      console.log(`[AUDIO] blob.type = ${blob.type}`);
      console.log(`[AUDIO] blob.size = ${blob.size}`);

      if (blob.size === 0) {
        console.error("[AUDIO] RIME AUDIO BYTES ARE EMPTY");
        setState("idle");
        return;
      }

      stopLocalPlayback();

      const url = URL.createObjectURL(blob);
      currentObjectUrlRef.current = url;

      const player = initAudioElement();
      if (!player) {
        throw new Error("Persistent audio element is not initialized");
      }

      player.pause();
      player.currentTime = 0;
      player.src = url;

      console.log("[AUDIO] audio.muted =", player.muted);
      console.log("[AUDIO] audio.volume =", player.volume);
      console.log("[AUDIO] audio.paused =", player.paused);
      console.log("[AUDIO] audio.readyState =", player.readyState);
      console.log("[AUDIO] audio.networkState =", player.networkState);
      console.log("[AUDIO] audio.currentTime =", player.currentTime);

      try {
        await player.play();
        console.log("[AUDIO] PLAY SUCCESS");
        if (requestIdRef.current === currentReqId) {
          setState("speaking");
        }
      } catch (error: any) {
        console.error("[AUDIO] PLAY FAILED", error);
        if (requestIdRef.current === currentReqId) {
          setState("idle");
        }
        stopLocalPlayback();
      }
    } catch (err: any) {
      console.error("[AUDIO TEST] Failed:", err);
      setErrorMessage("Test Rime Voice failed: " + (err.message || String(err)));
      setState("idle");
    }
  };

  const submitRecordedAudio = async (audioSource: string | Blob) => {
    const currentReqId = ++requestIdRef.current;
    let audioBlob: Blob;

    if (typeof audioSource === "string") {
      if (audioChunksRef.current.length === 0) {
        setState(isSessionActive ? "listening" : "idle");
        return;
      }
      audioBlob = new Blob(audioChunksRef.current, { type: audioSource });
    } else {
      audioBlob = audioSource;
    }

    if (audioBlob.size < 500) {
      setState(isSessionActive ? "listening" : "idle");
      return;
    }

    // Set thinking state when submitting VAD audio
    setState("thinking");

    const startTime = performance.now();
    let sttDoneTime: number | null = null;
    let llmDoneTime: number | null = null;
    let rimeFirstChunkTime: number | null = null;
    let playbackStartTime: number | null = null;

    const formData = new FormData();
    formData.append("sessionId", deviceIdRef.current);
    formData.append("conversationId", conversationId);
    formData.append("language", profileLanguage);
    formData.append("languageHint", profileLanguage);
    formData.append("audio", audioBlob, "user-recording.wav");

    console.log(`[AUDIO] POST /api/query (turn #${currentReqId}), blob size: ${audioBlob.size} bytes`);

    const abortController = new AbortController();
    activeAbortControllerRef.current = abortController;

    try {
      const response = await fetch(`${backendUrl}/api/query`, {
        method: "POST",
        headers: {
          "x-language": profileLanguage
        },
        body: formData,
        signal: abortController.signal
      });

      console.log(`[AUDIO] HTTP status: ${response.status}`);
      console.log(`[AUDIO] content-type: ${response.headers.get("content-type")}`);
      console.log(`[AUDIO] content-length: ${response.headers.get("content-length")}`);

      if (requestIdRef.current !== currentReqId) {
        console.log(`[AUDIO] turn #${currentReqId} dropped due to interruption.`);
        return;
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(
          errorJson.error || `Server responded with status ${response.status}`
        );
      }

      const rawTranscribedHeader =
        response.headers.get("x-transcribed-text") ||
        response.headers.get("X-Transcribed-Text");

      let userSpeechText = "";
      if (rawTranscribedHeader) {
        sttDoneTime = performance.now();
        try {
          userSpeechText = decodeURIComponent(rawTranscribedHeader);
        } catch {
          userSpeechText = rawTranscribedHeader;
        }
        setTranscribedText(userSpeechText);
      }

      const rawResponseHeader =
        response.headers.get("x-response-text") ||
        response.headers.get("X-Response-Text");

      let assistantText = "";
      if (rawResponseHeader) {
        llmDoneTime = performance.now();
        try {
          assistantText = decodeURIComponent(rawResponseHeader);
        } catch {
          assistantText = rawResponseHeader;
        }
      }

      const rawDetectedHeader =
        response.headers.get("x-detected-language") ||
        response.headers.get("X-Detected-Language");

      let detectedLang = "en";
      if (rawDetectedHeader) {
        detectedLang = decodeURIComponent(rawDetectedHeader);
      }

      if (userSpeechText) {
        setConversationTurns((prev) => [
          ...prev,
          {
            transcribedText: userSpeechText,
            responseText: assistantText || "Spoken guidance provided.",
            detectedLanguage: detectedLang,
            responseLanguage: detectedLang,
            createdAt: new Date().toISOString()
          }
        ]);
        const sttMs = sttDoneTime ? Math.round(sttDoneTime - startTime) : 0;
        const llmMs = (llmDoneTime && sttDoneTime) ? Math.round(llmDoneTime - sttDoneTime) : 0;

        setTelemetryLog({
          turnId: currentReqId,
          appState: "thinking",
          transcribedText: userSpeechText,
          detectedLanguage: detectedLang,
          sttLatencyMs: sttMs,
          llmLatencyMs: llmMs,
          rimeFirstChunkMs: 0,
          timeToFirstPlaybackMs: 0,
          totalTurnLatencyMs: 0,
          interrupted: false
        });
      }

      const rawActionHeader =
        response.headers.get("x-ui-action") ||
        response.headers.get("X-UI-Action");

      if (rawActionHeader) {
        const action = decodeURIComponent(rawActionHeader);
        if (action === "SHOW_BRIEFING") {
          setActiveCard("briefing");
          document.getElementById("briefing-card")?.scrollIntoView({ behavior: "smooth" });
        } else if (action === "SHOW_WEATHER") {
          setActiveCard("weather");
          document.getElementById("weather-card")?.scrollIntoView({ behavior: "smooth" });
        } else if (action === "SHOW_MANDI") {
          setActiveCard("mandi");
          document.getElementById("mandi-card")?.scrollIntoView({ behavior: "smooth" });
        } else if (action === "SHOW_SCHEMES") {
          setActiveCard("schemes");
          document.getElementById("schemes-card")?.scrollIntoView({ behavior: "smooth" });
        } else if (action === "SHOW_ADVISORY") {
          setActiveCard("advisory");
          document.getElementById("advisory-card")?.scrollIntoView({ behavior: "smooth" });
        } else if (action === "SCROLL_DOWN") {
          window.scrollBy({ top: 350, behavior: "smooth" });
        } else if (action === "SCROLL_UP") {
          window.scrollBy({ top: -350, behavior: "smooth" });
        } else if (action === "SHOW_PROFILE") {
          handleEditProfile();
        } else if (action === "SHOW_HISTORY") {
          openHistory();
        } else if (action === "NEW_CHAT") {
          handleNewChat();
        } else if (action === "GO_HOME") {
          handleGoHome();
        } else if (action === "GO_BACK") {
          setShowHistory(false);
          setViewingConversationId(null);
          setCurrentView("dashboard");
        }
      }

      // Read all response stream chunks to isolate audio playback diagnostics
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (requestIdRef.current !== currentReqId) {
            console.log(`[AUDIO] turn #${currentReqId} cancelled while reading response stream.`);
            try { reader.cancel(); } catch (e) {}
            return;
          }
          if (value && value.length > 0) {
            if (!rimeFirstChunkTime) {
              rimeFirstChunkTime = performance.now();
            }
            chunks.push(value);
            totalBytes += value.length;
          }
          if (done) break;
        }
      }

      if (requestIdRef.current !== currentReqId) return;

      const contentTypeHeader = response.headers.get("content-type") || "audio/wav";
      const totalBlob = chunks.length > 0
        ? new Blob(chunks as any[], { type: contentTypeHeader })
        : await response.blob().catch(() => new Blob([], { type: contentTypeHeader }));

      console.log("[QUERY AUDIO]");
      console.log(`status=${response.status}`);
      console.log(`contentType=${response.headers.get("content-type")}`);
      console.log(`totalBytes=${totalBytes}`);
      console.log(`blobType=${totalBlob.type}`);
      console.log(`blobSize=${totalBlob.size}`);

      if (totalBlob.size === 0) {
        console.error("[QUERY AUDIO] RIME AUDIO BYTES ARE EMPTY");
        setState(isSessionActive ? "listening" : "idle");
        return;
      }

      stopLocalPlayback();

      const audioUrl = URL.createObjectURL(totalBlob);
      currentObjectUrlRef.current = audioUrl;

      const audio = initAudioElement();
      if (!audio) {
        throw new Error("Persistent audio element is not initialized");
      }

      audio.pause();
      audio.currentTime = 0;
      audio.src = audioUrl;
      audio.volume = 1;
      audio.muted = false;

      console.log("[AUDIO] audio.muted =", audio.muted);
      console.log("[AUDIO] audio.volume =", audio.volume);
      console.log("[AUDIO] audio.paused =", audio.paused);
      console.log("[AUDIO] audio.readyState =", audio.readyState);
      console.log("[AUDIO] audio.networkState =", audio.networkState);
      console.log("[AUDIO] audio.currentTime =", audio.currentTime);

      try {
        await audio.play();
        console.log("[QUERY AUDIO] PLAY SUCCESS");
        if (requestIdRef.current === currentReqId) {
          playbackStartTime = performance.now();
          const sttMs = sttDoneTime ? Math.round(sttDoneTime - startTime) : 0;
          const llmMs = (llmDoneTime && sttDoneTime) ? Math.round(llmDoneTime - sttDoneTime) : 0;
          const rimeFirstMs = rimeFirstChunkTime ? Math.round(rimeFirstChunkTime - startTime) : 0;
          const playbackStartMs = Math.round(playbackStartTime - startTime);

          console.log("[VOICE LATENCY]");
          console.log(`STT=${sttMs}ms`);
          console.log(`LLM=${llmMs}ms`);
          console.log(`RIME_FIRST_AUDIO=${rimeFirstMs}ms`);
          console.log(`AUDIO_PLAYBACK_START=${playbackStartMs}ms`);
          console.log(`TOTAL=${playbackStartMs}ms`);

          setState("speaking");
          setTelemetryLog((prev) => prev ? {
            ...prev,
            appState: "speaking",
            rimeFirstChunkMs: rimeFirstMs,
            timeToFirstPlaybackMs: playbackStartMs
          } : null);
        }
      } catch (error: any) {
        console.error("[QUERY AUDIO] PLAY FAILED", error);
        if (requestIdRef.current === currentReqId) {
          setState(isSessionActive ? "listening" : "idle");
        }
        stopLocalPlayback();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      console.error("Query submission error:", err);
      setErrorMessage(
        "Communication error: " + (err.message || "Failed to contact server")
      );
      setState(isSessionActive ? "listening" : "idle");
    } finally {
      if (activeAbortControllerRef.current?.signal.aborted) {
        activeAbortControllerRef.current = null;
      }
    }
  };

  const handleNewChat = () => {
    stopLocalPlayback();
    let newId: string;
    try {
      newId = crypto.randomUUID();
    } catch {
      newId = "conv-" + Math.random().toString(36).substring(2, 15);
    }
    localStorage.setItem("krishakg_conversation_id", newId);
    setConversationId(newId);
    setConversationTurns([]);
    setTranscribedText(null);
    setErrorMessage(null);
    setShowHistory(false);
    setViewingConversationId(null);
  };


  const fetchHistoryList = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/history/${deviceIdRef.current}`
      );
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [backendUrl]);

  const fetchConversationDetail = async (convId: string) => {
    setTurnsLoading(true);
    setViewingConversationId(convId);
    try {
      const res = await fetch(
        `${backendUrl}/api/history/${deviceIdRef.current}/${convId}`
      );
      if (res.ok) {
        const data = await res.json();
        setViewingTurns(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversation detail:", err);
    } finally {
      setTurnsLoading(false);
    }
  };

  const openHistory = () => {
    stopLocalPlayback();
    fetchHistoryList();
    setShowHistory(true);
    setViewingConversationId(null);
  };

  // --- Hands-Free Session Hook ---
  const { isSessionActive, startSession, stopSession } = useHandsFreeSession(
    state,
    stopLocalPlayback,
    sendInterruptSignal,
    submitRecordedAudio,
    setErrorMessage
  );

  const getStatePill = useCallback(() => {
    const tDict = getTranslation(profileLanguage);
    if (state === "recording") {
      return { type: "listening", label: tDict.listening, sublabel: tDict.handsFreeSublabel };
    }
    if (state === "thinking") {
      return { type: "thinking", label: tDict.thinking, sublabel: tDict.thinkingMessage };
    }
    if (state === "speaking") {
      return {
        type: "speaking",
        label: tDict.speaking,
        sublabel: tDict.speaking
      };
    }
    if (state === "interrupted") {
      return { type: "interrupted", label: tDict.interrupted, sublabel: tDict.interrupted };
    }
    if (isSessionActive) {
      return { type: "listening", label: tDict.handsFreeActive, sublabel: tDict.handsFreeSublabel };
    }
    return { type: "idle", label: tDict.idle, sublabel: tDict.handsFreeSublabel };
  }, [state, isSessionActive, profileLanguage]);




  const handleGoHome = () => {
    if (isSessionActive) stopSession();
    stopLocalPlayback();
    setCurrentView("landing");
  };

  // --- 0a. LANDING PAGE ---
  if (currentView === "landing") {
    return (
      <LandingPage
        onGetStarted={() => {
          localStorage.setItem("krishakg_landing_seen", "true");
          setCurrentView("dashboard");
        }}
        onStartFieldMode={() => {
          localStorage.setItem("krishakg_landing_seen", "true");
          setCurrentView("dashboard");
          if (!isSessionActive) {
            startSession();
          }
        }}
      />
    );
  }

  // --- 0b. SPLASH SCREEN ---
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // --- 1. SETUP / PROFILE EDITOR SCREEN ---
  if (!isProfileComplete || showProfileEditor) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "#0b0f19" }}>
        <Header
          activeTab="dashboard"
          profileLanguage={profileLanguage}
          setProfileLanguage={setProfileLanguage}
          profileDistrict={profileDistrict}
          profileState={profileState}
          onGoHome={handleGoHome}
          onGoDashboard={() => {
            if (profileState && profileDistrict) {
              localStorage.setItem("krishakg_profile_complete", "true");
              setIsProfileComplete(true);
              setShowProfileEditor(false);
              setCurrentView("dashboard");
            }
          }}
          onOpenHistory={openHistory}
          onSelectWeather={() => {
            if (profileState && profileDistrict) {
              localStorage.setItem("krishakg_profile_complete", "true");
              setIsProfileComplete(true);
              setShowProfileEditor(false);
              setCurrentView("dashboard");
            }
          }}
          onSelectSchemes={() => {
            if (profileState && profileDistrict) {
              localStorage.setItem("krishakg_profile_complete", "true");
              setIsProfileComplete(true);
              setShowProfileEditor(false);
              setCurrentView("dashboard");
            }
          }}
          onEditProfile={handleEditProfile}
          onOpenSettings={handleEditProfile}
          onOpenNotifications={handleEditProfile}
        />
        <ProfileScreen
          data={profileData}
          onChange={handleProfileChange}
          onComplete={() => {
            localStorage.setItem("krishakg_profile_complete", "true");
            setIsProfileComplete(true);
            setShowProfileEditor(false);
            setCurrentView("dashboard");
          }}
        />
        <Footer profileLanguage={profileLanguage} />
      </div>
    );
  }

  const renderHeader = (activeTab: "home" | "dashboard" | "history" | "weather" | "schemes") => (
    <Header
      activeTab={activeTab}
      profileLanguage={profileLanguage}
      setProfileLanguage={setProfileLanguage}
      profileDistrict={profileDistrict}
      profileState={profileState}
      onGoHome={handleGoHome}
      onGoDashboard={() => {
        setShowHistory(false);
        setViewingConversationId(null);
        setCurrentView("dashboard");
      }}
      onOpenHistory={openHistory}
      onSelectWeather={() => {
        setShowHistory(false);
        setViewingConversationId(null);
        setCurrentView("dashboard");
        setActiveCard("weather");
        setTimeout(() => {
          document.getElementById("weather-card")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }}
      onSelectSchemes={() => {
        setShowHistory(false);
        setViewingConversationId(null);
        setCurrentView("dashboard");
        setActiveCard("schemes");
        setTimeout(() => {
          document.getElementById("schemes-card")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }}
      onEditProfile={handleEditProfile}
      onOpenSettings={handleEditProfile}
      onStartFieldMode={() => {
        setShowHistory(false);
        setViewingConversationId(null);
        setCurrentView("dashboard");
        if (!isSessionActive) {
          startSession();
        }
      }}
      onOpenNotifications={() => {
        setShowHistory(false);
        setViewingConversationId(null);
        setCurrentView("dashboard");
        setTimeout(() => {
          document.querySelector(".proactive-alert-banner")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }}
    />
  );

  // --- 2. HISTORY LIST SCREEN ---
  if (showHistory && !viewingConversationId) {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {renderHeader("history")}
        <div className="app-container" style={{ minHeight: "calc(100vh - 60px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ffffff" }}>Conversation History</h2>
              <p style={{ fontSize: "0.88rem", color: "#8b949e" }}>Past Voice & Advice Interactions</p>
            </div>
            <button
              type="button"
              className="edit-profile-btn"
              onClick={handleNewChat}
            >
              + New Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", width: "100%", paddingBottom: "1rem" }}>
            {historyLoading ? (
              <p style={{ color: "#8b949e", textAlign: "center", marginTop: "2rem" }}>
                Loading past conversations...
              </p>
            ) : historyList.length === 0 ? (
              <p style={{ color: "#6e7681", textAlign: "center", marginTop: "2rem", fontStyle: "italic" }}>
                No conversations yet. Start asking questions!
              </p>
            ) : (
              historyList.map((conv) => (
                <button
                  key={conv.conversationId}
                  type="button"
                  className="history-item"
                  onClick={() => fetchConversationDetail(conv.conversationId)}
                >
                  <span className="history-date">
                    {new Date(conv.startedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  <span className="history-preview">{conv.preview}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 3. CONVERSATION DETAIL / TRANSCRIPT SCREEN ---
  if (showHistory && viewingConversationId) {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {renderHeader("history")}
        <div className="app-container" style={{ minHeight: "calc(100vh - 60px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1rem" }}>
            <button
              type="button"
              className="edit-profile-btn"
              onClick={() => setViewingConversationId(null)}
            >
              ← Back to History
            </button>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#ffffff" }}>Transcript</h2>
            <div style={{ width: "80px" }} />
          </div>

          <div style={{ flex: 1, overflowY: "auto", width: "100%", paddingBottom: "1rem" }}>
            {turnsLoading ? (
              <p style={{ color: "#8b949e", textAlign: "center", marginTop: "2rem" }}>
                Loading transcript...
              </p>
            ) : viewingTurns.length === 0 ? (
              <p style={{ color: "#6e7681", textAlign: "center", marginTop: "2rem", fontStyle: "italic" }}>
                No turns found for this conversation.
              </p>
            ) : (
              viewingTurns.map((turn, index) => (
                <div key={index} className="transcript-turn">
                  <div className="transcript-user">
                    <span className="transcript-role">You said</span>
                    <p className="transcript-text">{turn.transcribedText}</p>
                    <span className="transcript-meta">
                      {turn.detectedLanguage === "hi" ? "Hindi" : turn.detectedLanguage === "en" ? "English" : turn.detectedLanguage}
                      {" · "}
                      {new Date(turn.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div className="transcript-assistant">
                    <span className="transcript-role transcript-role-assistant">Krishak-G said</span>
                    <p className="transcript-text">{turn.responseText}</p>
                    <span className="transcript-meta">
                      {turn.responseLanguage === "hi" ? "Hindi" : turn.responseLanguage === "en" ? "English" : turn.responseLanguage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 4. MICROPHONE VOICE SCREEN ---
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {renderHeader("dashboard")}
      <div className="app-container">



      {/* Proactive Field Intelligence Alert Banner */}
      <div className="proactive-alert-banner">
        <div className="proactive-alert-header">
          <div className="proactive-alert-title">
            <span>⚠️</span> {t.emergencyAlertTitle}
          </div>
          <span className="dash-badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", borderColor: "rgba(239, 68, 68, 0.4)" }}>
            {t.highPriority}
          </span>
        </div>
        <p className="proactive-alert-msg">
          {t.emergencyAlertMsg}
        </p>
      </div>

      {/* State Badge Indicator */}
      <div className="state-badge-container">
        <div className={`state-pill ${getStatePill().type}`}>
          <span className="state-pill-dot" />
          <span>{getStatePill().label}</span>
        </div>
      </div>

      {/* Live Conversation Chat Feed & Bubbles */}
      <div className="conversation-feed" ref={chatFeedRef}>
        {conversationTurns.length === 0 && !transcribedText && state !== "thinking" && (
          <div style={{ fontStyle: "italic", textAlign: "center", color: "#8b949e", padding: "1.5rem 1rem", fontSize: "0.9rem" }}>
            🎙️ {t.handsFreeInstruction}
          </div>
        )}

        {conversationTurns.map((turn, index) => (
          <React.Fragment key={index}>
            {/* User Speech Bubble */}
            <div className="chat-bubble user-bubble">
              <span className="bubble-role">👨‍🌾 {t.youSaid}</span>
              <p className="bubble-text">"{turn.transcribedText}"</p>
              <span className="bubble-meta">
                {turn.detectedLanguage}
                {" · "}
                {new Date(turn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Assistant Spoken Response Bubble */}
            <div className="chat-bubble assistant-bubble">
              <span className="bubble-role">🌾 {t.assistantName}</span>
              <p className="bubble-text">{turn.responseText}</p>
              <span className="bubble-meta">Spoken Response</span>
            </div>
          </React.Fragment>
        ))}

        {/* Pending Active Turn while processing */}
        {state === "thinking" && transcribedText && (
          <div className="chat-bubble user-bubble">
            <span className="bubble-role">👨‍🌾 {t.youSaid}</span>
            <p className="bubble-text">"{transcribedText}"</p>
          </div>
        )}

        {state === "thinking" && (
          <div className="chat-bubble assistant-bubble">
            <span className="bubble-role">🌾 {t.assistantName}</span>
            <p className="bubble-text" style={{ color: "#38bdf8", fontStyle: "italic" }}>
              {t.thinkingMessage}
            </p>
          </div>
        )}

        <div ref={turnsEndRef} />
      </div>


      {/* Error Message Banner */}
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      {/* Hands-Free Voice Orb Controls */}
      <div className="mic-section">
        <button
          id="mic-button"
          className={`mic-button ${state}`}
          onClick={isSessionActive ? stopSession : startSession}
          onMouseDown={isSessionActive ? undefined : startRecording}
          onMouseUp={isSessionActive ? undefined : stopRecording}
          onMouseLeave={isSessionActive ? undefined : stopRecording}
          onTouchStart={isSessionActive ? undefined : startRecording}
          onTouchEnd={isSessionActive ? undefined : stopRecording}
          onTouchCancel={isSessionActive ? undefined : stopRecording}
          title={isSessionActive ? "Click to Pause Hands-Free Session" : "Click to Start Hands-Free Session"}
          aria-label="Hands-Free Voice Orb"
        >
          <svg className="mic-icon" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>

        {state === "speaking" && (
          <div className="waveform-container" title="Rime AI Audio Streaming">
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
          </div>
        )}

        <div className="status-label">{getStatePill().label}</div>
        <div className="status-sublabel">{getStatePill().sublabel}</div>

        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={isSessionActive ? stopSession : startSession}
            style={{
              borderColor: isSessionActive ? "#ef4444" : "rgba(34, 197, 94, 0.4)",
              color: isSessionActive ? "#fca5a5" : "#4ade80",
              background: isSessionActive ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              padding: "0.4rem 1rem",
              fontSize: "0.85rem",
              borderRadius: "2rem"
            }}
          >
            {isSessionActive ? t.pauseHandsFree : t.startHandsFree}
          </button>

          <button
            type="button"
            onClick={handleTestRimeVoice}
            style={{
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "#38bdf8",
              fontSize: "0.75rem",
              borderRadius: "2rem",
              padding: "0.4rem 0.8rem",
              cursor: "pointer"
            }}
          >
            🔊 Test Rime Voice
          </button>

          <button
            type="button"
            onClick={() => setShowTelemetry(!showTelemetry)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#94a3b8",
              fontSize: "0.75rem",
              borderRadius: "2rem",
              padding: "0.4rem 0.8rem",
              cursor: "pointer"
            }}
          >
            {showTelemetry ? "Hide Debug" : "📊 Telemetry"}
          </button>
        </div>

        {showTelemetry && (
          <div style={{
            width: "100%",
            maxWidth: "500px",
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(34, 197, 94, 0.4)",
            borderRadius: "12px",
            padding: "0.8rem",
            marginTop: "0.8rem",
            fontSize: "0.75rem",
            color: "#cbd5e1",
            fontFamily: "monospace",
            textAlign: "left"
          }}>
            <div style={{ fontWeight: "bold", color: "#4ade80", marginBottom: "0.3rem" }}>⚡ TURN TELEMETRY DEBUG</div>
            <div>VAD Session: {isSessionActive ? "ACTIVE (Listening)" : "INACTIVE"}</div>
            <div>App State: {state}</div>
            <div>Sequence Request ID: #{requestIdRef.current}</div>
            <div>Latest STT: "{transcribedText || "None"}"</div>
            {telemetryLog && (
              <>
                <div>Detected Language: {telemetryLog.detectedLanguage}</div>
                <div>STT Latency: {telemetryLog.sttLatencyMs > 0 ? `${telemetryLog.sttLatencyMs} ms` : "Measuring..."}</div>
                <div>LLM Latency: {telemetryLog.llmLatencyMs > 0 ? `${telemetryLog.llmLatencyMs} ms` : "Measuring..."}</div>
                <div>Rime 1st Chunk: {telemetryLog.rimeFirstChunkMs > 0 ? `${telemetryLog.rimeFirstChunkMs} ms` : "Measuring..."}</div>
                <div>Time to 1st Playback: {telemetryLog.timeToFirstPlaybackMs > 0 ? `${telemetryLog.timeToFirstPlaybackMs} ms` : "Measuring..."}</div>
                <div>Total Turn Duration: {telemetryLog.totalTurnLatencyMs > 0 ? `${telemetryLog.totalTurnLatencyMs} ms` : "In Progress..."}</div>
                <div>Interrupted: {telemetryLog.interrupted ? "YES (Barge-In)" : "No"}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Today's Farm Briefing Widget */}
      <div style={{ width: "100%", marginBottom: "1.2rem" }}>
        <FarmBriefingWidget
          briefing={farmBriefing}
          loading={briefingLoading}
          onSpeakBriefing={(text) => {
            submitRecordedAudio(new Blob([text]));
          }}
          isHighlighted={activeCard === "briefing"}
        />
      </div>

      {/* Dynamic Voice Native Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Weather Card */}
        <div
          id="weather-card"
          className={`dash-card ${activeCard === "weather" ? "active" : ""}`}
          onClick={() => setActiveCard("weather")}
        >
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span>🌦️</span> {t.weatherTitle}
            </div>
            <span className="dash-badge">
              {dashboardData.loading ? t.loading : t.liveApi}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#8b949e", marginBottom: "0.5rem" }}>
            📍 {dashboardData.weather?.location || (profileDistrict && profileState ? `${profileDistrict}, ${profileState}` : "Farm Location")}
          </p>

          {dashboardData.loading ? (
            <div style={{ color: "#8b949e", fontStyle: "italic", fontSize: "0.85rem", padding: "0.5rem 0" }}>
              {t.loading}
            </div>
          ) : dashboardData.weatherError ? (
            <div style={{ color: "#fca5a5", fontSize: "0.82rem", background: "rgba(239, 68, 68, 0.1)", padding: "0.5rem", borderRadius: "0.5rem" }}>
              ⚠️ {dashboardData.weatherError}
            </div>
          ) : (
            <>
              <div className="dash-grid-two">
                <div className="dash-stat-box">
                  <div className="dash-stat-val">
                    {dashboardData.weather ? `${dashboardData.weather.temperature}°C` : "--"}
                  </div>
                  <div className="dash-stat-lbl">
                    {dashboardData.weather?.condition || t.temperature}
                  </div>
                </div>
                <div className="dash-stat-box">
                  <div className="dash-stat-val" style={{ color: "#4ade80" }}>
                    {dashboardData.weather ? `${dashboardData.weather.humidity}%` : "--"}
                  </div>
                  <div className="dash-stat-lbl">
                    {dashboardData.weather ? `${t.wind}: ${dashboardData.weather.windSpeed} km/h` : t.humidity}
                  </div>
                </div>
              </div>
              {dashboardData.weather?.advisory && (
                <p style={{ fontSize: "0.8rem", color: "#c9d1d9", marginTop: "0.6rem", fontStyle: "italic" }}>
                  💡 {dashboardData.weather.advisory}
                </p>
              )}
            </>
          )}

          <div style={{ fontSize: "0.7rem", color: "#6e7681", marginTop: "0.6rem", textAlign: "right" }}>
            {dashboardData.weatherTimestamp ? `Updated ${dashboardData.weatherTimestamp} IST · OpenWeatherMap API` : "Live OpenWeather API"}
          </div>
        </div>

        {/* Mandi Prices Card */}
        <div
          id="mandi-card"
          className={`dash-card ${activeCard === "mandi" ? "active" : ""}`}
          onClick={() => setActiveCard("mandi")}
        >
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span>🌾</span> {t.mandiTitle}
            </div>
            <span className="dash-badge" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.3)" }}>
              {t.agmarknet}
            </span>
          </div>

          {dashboardData.loading ? (
            <div style={{ color: "#8b949e", fontStyle: "italic", fontSize: "0.85rem", padding: "0.5rem 0" }}>
              {t.loading}
            </div>
          ) : dashboardData.mandiPrices.length > 0 ? (
            dashboardData.mandiPrices.map((item, idx) => (
              <div key={idx} className="mandi-item-row" style={idx === dashboardData.mandiPrices.length - 1 ? { marginBottom: 0 } : {}}>
                <div>
                  <span className="mandi-item-name">{item.cropName}</span>
                  <div style={{ fontSize: "0.72rem", color: "#8b949e" }}>🏛️ {item.market}</div>
                </div>
                <span className="mandi-item-price">₹{item.pricePerQuintal.toLocaleString()} / qtl</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#8b949e", fontSize: "0.82rem", fontStyle: "italic", padding: "0.5rem 0" }}>
              {dashboardData.mandiError || "No active mandi records found for this district."}
            </div>
          )}

          <div style={{ fontSize: "0.7rem", color: "#6e7681", marginTop: "0.6rem", textAlign: "right" }}>
            {dashboardData.mandiTimestamp ? `Updated ${dashboardData.mandiTimestamp} IST · Source: AGMARKNET` : "Source: AGMARKNET"}
          </div>
        </div>

        {/* Government Schemes Card */}
        <div
          id="schemes-card"
          className={`dash-card ${activeCard === "schemes" ? "active" : ""}`}
          onClick={() => setActiveCard("schemes")}
        >
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span>🏛️</span> {t.schemesTitle}
            </div>
            <span className="dash-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.3)" }}>
              {t.officialDataset}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {dashboardData.schemes.slice(0, 3).map((scheme) => (
              <div key={scheme.id} style={{ padding: "0.6rem 0.75rem", background: "#0d1117", borderRadius: "0.5rem", border: "1px solid #21262d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#f0f6fc" }}>{scheme.name}</div>
                  <a
                    href={scheme.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: "0.72rem", color: "#38bdf8", textDecoration: "underline" }}
                  >
                    {t.applyNow}
                  </a>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#4ade80", fontWeight: 600, marginBottom: "0.15rem" }}>{scheme.benefit}</div>
                <div style={{ fontSize: "0.75rem", color: "#8b949e" }}>{scheme.description}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "0.7rem", color: "#6e7681", marginTop: "0.6rem", textAlign: "right" }}>
            Updated {dashboardData.schemesTimestamp || "Today"} IST · myScheme.gov.in
          </div>
        </div>

        {/* Crop Advisory Card */}
        <div
          id="advisory-card"
          className={`dash-card ${activeCard === "advisory" ? "active" : ""}`}
          onClick={() => setActiveCard("advisory")}
        >
          <div className="dash-card-header">
            <div className="dash-card-title">
              <span>🧪</span> {t.advisoryTitle}
            </div>
            <span className="dash-badge" style={{ background: "rgba(251, 146, 60, 0.15)", color: "#fb923c", borderColor: "rgba(251, 146, 60, 0.3)" }}>
              {dashboardData.advisory?.season || t.agronomicAdvice}
            </span>
          </div>

          {dashboardData.advisory ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <p style={{ fontSize: "0.84rem", color: "#c9d1d9", lineHeight: 1.4 }}>
                <strong>🌾 {t.guidanceLabel}</strong> {dashboardData.advisory.fertilizerRecommendation}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#fb923c", lineHeight: 1.3 }}>
                <strong>⚠️ {t.pestAlertLabel}</strong> {dashboardData.advisory.pestWarning}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#4ade80", lineHeight: 1.3 }}>
                <strong>✅ {t.actionRecommendedLabel}</strong> {dashboardData.advisory.actionRequired}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#c9d1d9", lineHeight: 1.4 }}>
              Ask Krishak-G anytime for precise fertilizer dosage recommendations, spray timings, and pest control management.
            </p>
          )}


          <div style={{ fontSize: "0.7rem", color: "#6e7681", marginTop: "0.6rem", textAlign: "right" }}>
            {dashboardData.advisoryTimestamp ? `Updated ${dashboardData.advisoryTimestamp} IST · ${dashboardData.advisory?.source || "ICAR Agromet Advisory"}` : "ICAR Agromet Advisory"}
          </div>
        </div>
      </div>
    </div>
    <Footer profileLanguage={profileLanguage} />
  </div>
  );
}
