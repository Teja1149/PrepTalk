import { useEffect, useRef, useState } from "react";

const normalizeLanguageCode = (languageCode, languageName, text = "") => {
  const code = String(languageCode || "").trim().toLowerCase();
  const name = String(languageName || "").trim().toLowerCase();

  const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
  const hasHindi = /[\u0900-\u097F]/.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text);
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(text);
  const hasBengali = /[\u0980-\u09FF]/.test(text);
  const hasGujarati = /[\u0A80-\u0AFF]/.test(text);

  if (hasTelugu) return "te-IN";
  if (hasHindi) return "hi-IN";
  if (hasTamil) return "ta-IN";
  if (hasKannada) return "kn-IN";
  if (hasMalayalam) return "ml-IN";
  if (hasBengali) return "bn-IN";
  if (hasGujarati) return "gu-IN";

  if (code === "te" || code === "te-in" || name.includes("telugu")) {
    return "te-IN";
  }

  if (code === "hi" || code === "hi-in" || name.includes("hindi")) {
    return "hi-IN";
  }

  if (code === "ta" || code === "ta-in" || name.includes("tamil")) {
    return "ta-IN";
  }

  if (code === "kn" || code === "kn-in" || name.includes("kannada")) {
    return "kn-IN";
  }

  if (code === "ml" || code === "ml-in" || name.includes("malayalam")) {
    return "ml-IN";
  }

  if (code === "mr" || code === "mr-in" || name.includes("marathi")) {
    return "mr-IN";
  }

  if (code === "bn" || code === "bn-in" || name.includes("bengali")) {
    return "bn-IN";
  }

  if (code === "gu" || code === "gu-in" || name.includes("gujarati")) {
    return "gu-IN";
  }

  if (code === "en" || code === "en-us" || name.includes("english")) {
    return "en-US";
  }

  return "en-US";
};

const getBestVoice = (voices, speechCode) => {
  const langPrefix = speechCode.split("-")[0].toLowerCase();

  const exactVoice = voices.find(
    (voice) => voice.lang?.toLowerCase() === speechCode.toLowerCase()
  );

  if (exactVoice) return exactVoice;

  const prefixVoice = voices.find((voice) =>
    voice.lang?.toLowerCase().startsWith(langPrefix)
  );

  if (prefixVoice) return prefixVoice;

  return null;
};

const useSpeechSynthesis = ({ onEnd } = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const loadVoices = () => {
    if (!window.speechSynthesis) return;

    const availableVoices = window.speechSynthesis.getVoices();

    setVoices(availableVoices);

    console.log(
      "Available browser voices:",
      availableVoices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService
      }))
    );
  };

  useEffect(() => {
    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const timer = setTimeout(loadVoices, 500);

    return () => {
      clearTimeout(timer);

      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = (text, languageCode = "en-US", languageName = "") => {
    if (!text) return;

    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const availableVoices =
      voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    const speechCode = normalizeLanguageCode(
      languageCode,
      languageName,
      text
    );

    const bestVoice = getBestVoice(availableVoices, speechCode);

    console.log("Speech request:", {
      text,
      languageCode,
      languageName,
      detectedSpeechCode: speechCode,
      selectedVoice: bestVoice
        ? {
            name: bestVoice.name,
            lang: bestVoice.lang
          }
        : null
    });

    if (!bestVoice && speechCode !== "en-US") {
      console.warn(
        `No browser voice found for ${speechCode}. Install the ${speechCode} voice in your OS/browser.`
      );

      setIsSpeaking(false);

      if (onEndRef.current) {
        onEndRef.current();
      }

      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.lang = speechCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      if (onEndRef.current) {
        onEndRef.current();
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);

      setIsSpeaking(false);

      if (onEndRef.current) {
        onEndRef.current();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    voices,
    speak,
    stopSpeaking
  };
};

export default useSpeechSynthesis;