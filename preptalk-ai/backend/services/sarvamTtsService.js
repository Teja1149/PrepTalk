const axios = require("axios");

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

const SUPPORTED_LANGUAGE_CODES = new Set([
  "hi-IN",
  "bn-IN",
  "ta-IN",
  "te-IN",
  "gu-IN",
  "kn-IN",
  "ml-IN",
  "mr-IN",
  "pa-IN",
  "od-IN",
  "en-IN"
]);

const BULBUL_V3_SPEAKERS = new Set([
  "shubh",
  "aditya",
  "ritu",
  "priya",
  "neha",
  "rahul",
  "pooja",
  "rohan",
  "simran",
  "kavya",
  "amit",
  "dev",
  "ishita",
  "shreya",
  "ratan",
  "varun",
  "manan",
  "sumit",
  "roopa",
  "kabir",
  "aayan",
  "ashutosh",
  "advait",
  "anand",
  "tanya",
  "tarun",
  "sunny",
  "mani",
  "gokul",
  "vijay",
  "shruti",
  "suhani",
  "mohit",
  "kavitha",
  "rehan",
  "soham",
  "rupali"
]);

const BULBUL_V2_SPEAKERS = new Set([
  "anushka",
  "manisha",
  "vidya",
  "arya",
  "abhilash",
  "karun",
  "hitesh"
]);

const detectLanguageFromText = (text = "") => {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN";
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN";
  if (/[\u0980-\u09FF]/.test(text)) return "bn-IN";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN";

  return "en-IN";
};

const normalizeLanguageCode = (languageCode, languageName, text) => {
  const code = String(languageCode || "").trim();
  const lowerCode = code.toLowerCase();
  const name = String(languageName || "").toLowerCase();

  if (SUPPORTED_LANGUAGE_CODES.has(code)) return code;

  if (
    lowerCode === "en" ||
    lowerCode === "en-us" ||
    lowerCode === "en-gb" ||
    lowerCode === "english" ||
    name.includes("english")
  ) {
    return "en-IN";
  }

  if (lowerCode === "hi" || lowerCode === "hi-in" || name.includes("hindi")) {
    return "hi-IN";
  }

  if (lowerCode === "te" || lowerCode === "te-in" || name.includes("telugu")) {
    return "te-IN";
  }

  if (lowerCode === "ta" || lowerCode === "ta-in" || name.includes("tamil")) {
    return "ta-IN";
  }

  if (lowerCode === "kn" || lowerCode === "kn-in" || name.includes("kannada")) {
    return "kn-IN";
  }

  if (
    lowerCode === "ml" ||
    lowerCode === "ml-in" ||
    name.includes("malayalam")
  ) {
    return "ml-IN";
  }

  if (lowerCode === "mr" || lowerCode === "mr-in" || name.includes("marathi")) {
    return "mr-IN";
  }

  if (lowerCode === "bn" || lowerCode === "bn-in" || name.includes("bengali")) {
    return "bn-IN";
  }

  if (lowerCode === "gu" || lowerCode === "gu-in" || name.includes("gujarati")) {
    return "gu-IN";
  }

  if (lowerCode === "pa" || lowerCode === "pa-in" || name.includes("punjabi")) {
    return "pa-IN";
  }

  if (
    lowerCode === "od" ||
    lowerCode === "or" ||
    lowerCode === "od-in" ||
    lowerCode === "or-in" ||
    name.includes("odia")
  ) {
    return "od-IN";
  }

  return detectLanguageFromText(text);
};

const sanitizeTextForTts = (text = "") => {
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/[_#`~]/g, "")
    .replace(/[•●▪▫]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000);
};

const normalizeModel = (model) => {
  const value = String(model || "").trim().toLowerCase();

  if (value === "bulbul:v2") return "bulbul:v2";
  return "bulbul:v3";
};

const normalizeSpeaker = (model, speaker) => {
  const cleanSpeaker = String(speaker || "")
    .trim()
    .toLowerCase();

  if (model === "bulbul:v3") {
    if (BULBUL_V3_SPEAKERS.has(cleanSpeaker)) {
      return cleanSpeaker;
    }

    console.warn(
      `Invalid speaker "${speaker}" for bulbul:v3. Falling back to "shubh".`
    );

    return "shubh";
  }

  if (model === "bulbul:v2") {
    if (BULBUL_V2_SPEAKERS.has(cleanSpeaker)) {
      return cleanSpeaker;
    }

    console.warn(
      `Invalid speaker "${speaker}" for bulbul:v2. Falling back to "anushka".`
    );

    return "anushka";
  }

  return "shubh";
};

const extractAudioBase64 = (data) => {
  if (!data) return null;

  if (Array.isArray(data.audios) && data.audios.length > 0) {
    return data.audios[0];
  }

  if (typeof data.audio === "string") return data.audio;
  if (typeof data.audio_base64 === "string") return data.audio_base64;
  if (typeof data.output_audio === "string") return data.output_audio;

  return null;
};

const convertTextToSpeech = async ({ text, languageCode, languageName }) => {
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

  if (!SARVAM_API_KEY) {
    throw new Error("Missing SARVAM_API_KEY in backend .env");
  }

  const cleanText = sanitizeTextForTts(text);

  if (!cleanText) {
    throw new Error("Text is required for TTS");
  }

  const model = normalizeModel(process.env.SARVAM_TTS_MODEL || "bulbul:v3");
  const speaker = normalizeSpeaker(
    model,
    process.env.SARVAM_TTS_SPEAKER || "shubh"
  );

  const sampleRate = Number(process.env.SARVAM_TTS_SAMPLE_RATE || 24000);

  const targetLanguageCode = normalizeLanguageCode(
    languageCode,
    languageName,
    cleanText
  );

  const payload = {
    text: cleanText,
    target_language_code: targetLanguageCode,
    model,
    speaker,
    pace: 0.95,
    speech_sample_rate: sampleRate,
    output_audio_codec: "wav",
    temperature: 0.6
  };

  console.log("Sarvam TTS request payload:", {
    ...payload,
    text: cleanText.slice(0, 100)
  });

  try {
    const response = await axios.post(SARVAM_TTS_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY
      },
      timeout: 30000
    });

    console.log("Sarvam response status:", response.status);
    console.log("Sarvam response keys:", Object.keys(response.data || {}));

    const audioBase64 = extractAudioBase64(response.data);

    if (!audioBase64) {
      console.error("Sarvam response without audio:", response.data);
      throw new Error("Sarvam TTS did not return audio");
    }

    return {
      audioBase64,
      mimeType: "audio/wav",
      languageCode: targetLanguageCode,
      requestId: response.data?.request_id || response.data?.requestId || null
    };
  } catch (error) {
    console.error("Sarvam API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    throw error;
  }
};

module.exports = {
  convertTextToSpeech,
  normalizeLanguageCode
};