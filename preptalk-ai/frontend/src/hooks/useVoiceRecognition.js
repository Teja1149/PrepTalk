import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { supabase } from "../services/supabaseClient";

const CALIBRATION_TIME = 400;
const MIN_RECORDING_TIME = 1000;
const SILENCE_AFTER_SPEECH = 1300;
const MAX_RECORDING_TIME = 25000;
const MIN_AUDIO_SIZE = 1500;

const useVoiceRecognition = ({
  conversationId,
  mode,
  topic,
  onInterim,
  onFinal,
  onError
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("idle");

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startedAtRef = useRef(0);
  const speechStartedAtRef = useRef(null);
  const lastSpeechAtRef = useRef(null);

  const noiseSamplesRef = useRef([]);
  const noiseFloorRef = useRef(0.015);

  const isListeningRef = useRef(false);
  const isStoppingRef = useRef(false);
  const shouldProcessRef = useRef(true);

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
  };

  const getVolume = () => {
    const analyser = analyserRef.current;

    if (!analyser) return 0;

    const dataArray = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;

    for (let i = 0; i < dataArray.length; i += 1) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / dataArray.length);
  };

  const getSpeechThreshold = () => {
    const dynamicThreshold = noiseFloorRef.current * 2.8;
    return Math.max(0.018, Math.min(dynamicThreshold, 0.06));
  };

  const sendToBackend = async (audioBlob) => {
    try {
      setVoiceStatus("processing");

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("User session not found. Please login again.");
      }

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      formData.append("conversationId", conversationId);
      formData.append("mode", mode || "natural");

      if (topic) {
        formData.append("topic", topic);
      }

      console.log("Sending voice to backend:", {
        size: audioBlob.size,
        conversationId,
        mode,
        topic
      });

      const response = await axios.post(
        `${backendUrl}/api/transcribe`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          timeout: 70000
        }
      );

      console.log("Voice backend response:", response.data);

      if (response.data?.success && onFinal) {
        onFinal({
          transcript: response.data.transcript || "",
          reply: response.data.reply || "",
          language: response.data.language || "English",
          languageCode: response.data.languageCode || "en-IN"
        });

        return;
      }

      throw new Error(
        response.data?.error ||
          response.data?.message ||
          "Voice processing failed"
      );
    } catch (error) {
      console.error("Voice processing failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (onError) {
        onError(
          error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Voice processing failed. Please try again."
        );
      }
    } finally {
      setVoiceStatus("idle");
    }
  };

  const stopListening = ({ processAudio = true } = {}) => {
    if (isStoppingRef.current) return;

    isStoppingRef.current = true;
    shouldProcessRef.current = processAudio;
    isListeningRef.current = false;

    setIsListening(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudio();
      setVoiceStatus("idle");
      isStoppingRef.current = false;
    }
  };

  const detectSpeechLoop = () => {
    if (!isListeningRef.current) return;

    const now = Date.now();
    const elapsed = now - startedAtRef.current;
    const volume = getVolume();

    if (elapsed <= CALIBRATION_TIME) {
      noiseSamplesRef.current.push(volume);

      if (onInterim) {
        onInterim("Calibrating mic...");
      }

      animationFrameRef.current = requestAnimationFrame(detectSpeechLoop);
      return;
    }

    if (noiseSamplesRef.current.length > 0) {
      const sorted = [...noiseSamplesRef.current].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);

      noiseFloorRef.current = sorted[middle] || 0.015;
      noiseSamplesRef.current = [];
    }

    const speechThreshold = getSpeechThreshold();
    const isSpeech = volume > speechThreshold;

    if (isSpeech) {
      if (!speechStartedAtRef.current) {
        speechStartedAtRef.current = now;

        console.log("Speech started:", {
          volume,
          speechThreshold,
          noiseFloor: noiseFloorRef.current
        });
      }

      lastSpeechAtRef.current = now;

      if (onInterim) {
        onInterim("Listening... keep speaking");
      }
    } else {
      if (!speechStartedAtRef.current) {
        if (onInterim) {
          onInterim("Mic is on... start speaking");
        }
      } else if (onInterim) {
        onInterim("Waiting for you to finish...");
      }
    }

    const hasSpeechStarted = Boolean(speechStartedAtRef.current);
    const silenceAfterSpeech = hasSpeechStarted
      ? now - lastSpeechAtRef.current
      : 0;

    if (
      hasSpeechStarted &&
      elapsed > MIN_RECORDING_TIME &&
      silenceAfterSpeech >= SILENCE_AFTER_SPEECH
    ) {
      console.log("Stopping after silence:", {
        silenceAfterSpeech,
        elapsed
      });

      stopListening({ processAudio: true });
      return;
    }

    if (elapsed >= MAX_RECORDING_TIME) {
      console.log("Stopping after max recording time:", {
        elapsed
      });

      stopListening({ processAudio: true });
      return;
    }

    animationFrameRef.current = requestAnimationFrame(detectSpeechLoop);
  };

  const startListening = async () => {
    try {
      if (isListeningRef.current || voiceStatus === "processing") {
        return;
      }

      if (!conversationId) {
        throw new Error("conversationId is missing");
      }

      chunksRef.current = [];
      noiseSamplesRef.current = [];

      noiseFloorRef.current = 0.015;
      speechStartedAtRef.current = null;
      lastSpeechAtRef.current = null;
      startedAtRef.current = Date.now();

      isStoppingRef.current = false;
      shouldProcessRef.current = true;

      setVoiceStatus("starting");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType
        });

        cleanupAudio();
        isStoppingRef.current = false;

        const hadSpeech = Boolean(speechStartedAtRef.current);

        console.log("Recorder stopped:", {
          processAudio: shouldProcessRef.current,
          audioSize: audioBlob.size,
          hadSpeech
        });

        if (!shouldProcessRef.current) {
          setVoiceStatus("idle");
          return;
        }

        if (!hadSpeech) {
          setVoiceStatus("idle");

          if (onInterim) {
            onInterim("");
          }

          if (onError) {
            onError("I could not hear your voice clearly. Please speak again.");
          }

          return;
        }

        if (audioBlob.size < MIN_AUDIO_SIZE) {
          setVoiceStatus("idle");

          if (onError) {
            onError("The voice recording was too short. Please try again.");
          }

          return;
        }

        await sendToBackend(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);

        if (onError) {
          onError("Microphone recording failed. Please try again.");
        }

        stopListening({ processAudio: false });
      };

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("AudioContext is not supported in this browser.");
      }

      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      mediaRecorder.start(250);

      isListeningRef.current = true;
      setIsListening(true);
      setVoiceStatus("listening");

      detectSpeechLoop();
    } catch (error) {
      console.error("Could not start microphone:", {
        message: error.message,
        error
      });

      cleanupAudio();

      isListeningRef.current = false;
      isStoppingRef.current = false;

      setIsListening(false);
      setVoiceStatus("idle");

      if (onError) {
        onError(
          error.message ||
            "Could not start microphone. Please allow microphone permission."
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        shouldProcessRef.current = false;
        mediaRecorderRef.current.stop();
      }

      cleanupAudio();
    };
  }, []);

  return {
    isListening,
    voiceStatus,
    startListening,
    stopListening
  };
};

export default useVoiceRecognition;