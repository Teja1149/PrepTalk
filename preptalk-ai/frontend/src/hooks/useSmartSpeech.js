import { useEffect, useRef, useState } from "react";
import { generateSarvamSpeech } from "../services/ttsService";

const useSmartSpeech = ({ onEnd } = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRef = useRef(null);
  const onEndRef = useRef(onEnd);
  const speakingTokenRef = useRef(0);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const finishSpeaking = (token) => {
    if (token !== speakingTokenRef.current) return;

    console.log("Speech finished");

    setIsSpeaking(false);
    audioRef.current = null;

    if (onEndRef.current) {
      onEndRef.current();
    }
  };

  const stopSpeaking = () => {
    speakingTokenRef.current += 1;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    setIsSpeaking(false);
  };

  const speak = async (
    text,
    languageCode = "en-IN",
    languageName = "English"
  ) => {
    if (!text || !String(text).trim()) {
      console.warn("Speech skipped because text is empty");
      return;
    }

    stopSpeaking();

    const token = speakingTokenRef.current + 1;
    speakingTokenRef.current = token;

    try {
      setIsSpeaking(true);

      console.log("Calling Sarvam TTS:", {
        text,
        languageCode,
        languageName
      });

      const result = await generateSarvamSpeech({
        text,
        languageCode,
        languageName
      });

      console.log("Sarvam TTS frontend response:", {
        success: result?.success,
        mimeType: result?.mimeType,
        languageCode: result?.languageCode,
        audioLength: result?.audioBase64?.length,
        error: result?.error,
        errorData: result?.errorData
      });

      if (token !== speakingTokenRef.current) return;

      if (!result?.success || !result?.audioBase64) {
        throw new Error(result?.error || "Sarvam response does not contain audio");
      }

      const mimeType = result.mimeType || "audio/wav";
      const audioSrc = `data:${mimeType};base64,${result.audioBase64}`;

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.preload = "auto";
      audio.volume = 1;

      audio.onloadedmetadata = () => {
        console.log("Audio metadata loaded:", {
          duration: audio.duration,
          mimeType
        });
      };

      audio.onplay = () => {
        console.log("Audio playback started");

        if (token === speakingTokenRef.current) {
          setIsSpeaking(true);
        }
      };

      audio.onended = () => {
        finishSpeaking(token);
      };

      audio.onerror = () => {
        console.error("Audio playback error:", audio.error);
        finishSpeaking(token);
      };

      await audio.play();
    } catch (error) {
      console.error("Sarvam speech failed:", error);

      if (token === speakingTokenRef.current) {
        setIsSpeaking(false);

        if (onEndRef.current) {
          onEndRef.current();
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    isSpeaking,
    speak,
    stopSpeaking
  };
};

export default useSmartSpeech;