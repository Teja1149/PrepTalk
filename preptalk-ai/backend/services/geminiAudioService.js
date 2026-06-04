const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_AUDIO_MODEL = process.env.GEMINI_AUDIO_MODEL || "gemini-2.0-flash";

const getMimeType = (originalMimeType, filename = "") => {
  if (originalMimeType && originalMimeType.includes("audio")) {
    if (originalMimeType.includes(";")) {
      return originalMimeType.split(";")[0];
    }

    return originalMimeType;
  }

  const lower = filename.toLowerCase();

  if (lower.endsWith(".webm")) return "audio/webm";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mp3";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".ogg")) return "audio/ogg";

  return "audio/webm";
};

const safeJsonParse = (text) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error2) {
      const match = cleaned.match(/\{[\s\S]*\}/);

      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (error3) {
          return null;
        }
      }

      return null;
    }
  }
};

const normalizeLanguageCode = (languageCode, language, transcript) => {
  const code = String(languageCode || "").trim();
  const name = String(language || "").toLowerCase();
  const text = String(transcript || "");

  if (code.includes("-")) {
    if (code === "en-US" || code === "en-GB") return "en-IN";
    return code;
  }

  if (/[\u0C00-\u0C7F]/.test(text) || name.includes("telugu")) return "te-IN";
  if (/[\u0900-\u097F]/.test(text) || name.includes("hindi")) return "hi-IN";
  if (/[\u0B80-\u0BFF]/.test(text) || name.includes("tamil")) return "ta-IN";
  if (/[\u0C80-\u0CFF]/.test(text) || name.includes("kannada")) return "kn-IN";
  if (/[\u0D00-\u0D7F]/.test(text) || name.includes("malayalam")) return "ml-IN";
  if (/[\u0980-\u09FF]/.test(text) || name.includes("bengali")) return "bn-IN";
  if (/[\u0A80-\u0AFF]/.test(text) || name.includes("gujarati")) return "gu-IN";
  if (/[\u0A00-\u0A7F]/.test(text) || name.includes("punjabi")) return "pa-IN";

  if (name.includes("english")) return "en-IN";

  return "en-IN";
};

const processVoiceWithGemini = async ({
  audioBuffer,
  originalname,
  mimeType,
  mode,
  topic,
  previousMessages = []
}) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in backend .env");
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Audio buffer is empty");
  }

  const cleanMimeType = getMimeType(mimeType, originalname);
  const audioBase64 = audioBuffer.toString("base64");

  const recentContext = previousMessages
    .slice(-8)
    .map((msg) => {
      const role = msg.sender === "user" ? "User" : "PrepTalk AI";
      return `${role}: ${msg.message}`;
    })
    .join("\n");

  const prompt = `
You are PrepTalk AI.

This is a live voice conversation. The user is speaking to you naturally.

Your job:
1. Understand the user's spoken input correctly.
2. Identify what the user wants.
3. Give the most useful response, not just another question.
4. Keep the reply short, clear, and spoken-friendly.
5. Reply in the same language or mixed-language style used by the user.

Return only valid JSON. Do not use markdown.

JSON format:
{
  "transcript": "exact user speech text",
  "language": "detected language name",
  "languageCode": "BCP-47 code like en-IN, hi-IN, te-IN",
  "intent": "short description of what the user wants",
  "reply": "useful spoken reply"
}

Conversation mode: ${mode || "natural"}
Preparation topic: ${topic || "none"}

Recent conversation:
${recentContext || "No previous messages."}

Response rules:
- Do not always ask questions.
- Ask a question only when you genuinely need more information.
- If the user asks a question, answer it directly.
- If the user gives an interview answer, evaluate it briefly, correct it if needed, then continue.
- If the user sounds confused, explain simply.
- If the user gives a short or unclear answer, gently ask one clarification.
- Keep replies under 2 short sentences.
- Avoid long lectures.
- Avoid generic motivation.
- Avoid repeatedly saying "tell me more" or "what would you like".
- Do not use bullet points.
- Do not use markdown.
- Speak like a real human coach.

Professional mode behavior:
- If the topic is interview preparation, behave like an interviewer plus coach.
- Ask one interview question only when it is time for the next question.
- After the user answers, first give useful feedback.
- Then either correct the answer or move to the next question.
- Do not keep asking random follow-up questions.

Natural mode behavior:
- Respond warmly and naturally.
- Continue the conversation based on the user's actual words.
- Do not force every reply to end with a question.
`;

  const modelsToTry = [
    GEMINI_AUDIO_MODEL,
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
  ];

  let lastError = null;

  for (const model of [...new Set(modelsToTry)]) {
    try {
      console.log("Calling Gemini audio model:", {
        model,
        cleanMimeType,
        audioBytes: audioBuffer.length
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMimeType,
                    data: audioBase64
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.35,
            topP: 0.8,
            maxOutputTokens: 180,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      const rawText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      console.log("Gemini raw text:", rawText);

      const parsed = safeJsonParse(rawText);

      if (!parsed) {
        throw new Error("Could not parse Gemini JSON response");
      }

      const transcript = parsed.transcript || "";
      const language = parsed.language || "English";
      const languageCode = normalizeLanguageCode(
        parsed.languageCode,
        language,
        transcript
      );

      return {
        transcript,
        language,
        languageCode,
        reply:
          parsed.reply ||
          "Sorry, I could not understand clearly. Can you say that again?"
      };
    } catch (error) {
      lastError = error;

      console.error("Gemini audio model failed:", {
        model,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
  }

  throw lastError || new Error("All Gemini audio models failed");
};

module.exports = {
  processVoiceWithGemini
};