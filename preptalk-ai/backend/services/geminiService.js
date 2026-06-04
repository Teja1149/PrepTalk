const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const buildSystemPrompt = ({ mode, topic, language }) => {
  const languageRule = `
LANGUAGE RULE:
- Reply in the same language as the user's latest message.
- If the user mixes languages, reply naturally in the same mixed style.
- Do not translate to English unless the user asks.
- If detected language is available, consider it as: ${language || "auto"}.
`;

  const baseRules = `
CRITICAL INSTRUCTIONS:
- You are participating in a LIVE voice-to-voice conversation.
- Keep your responses very short. Maximum 1 or 2 sentences.
- Never use bullet points, numbered lists, markdown, or bold text.
- Speak exactly like a real human.
- Use natural conversational fillers occasionally.
- Always end your turn by asking one short natural question.
${languageRule}
`;

  if (mode === "professional") {
    return `${baseRules}
Your role: You are PrepTalk AI, a friendly professional preparation coach.
Context: You are helping the user prepare for: ${topic || "a professional topic"}.
Action: Ask one interview question or scenario at a time, listen to their answer, give brief feedback, and continue naturally.`;
  }

  return `${baseRules}
Your role: You are PrepTalk AI, a kind, empathetic, natural conversation partner.
Context: A casual, friendly voice chat.
Action: Talk warmly, respond to emotion, and keep the conversation flowing naturally.`;
};

const generateGeminiResponse = async ({
  mode,
  topic,
  language,
  messages,
  userMessage
}) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const systemPrompt = buildSystemPrompt({
    mode,
    topic,
    language
  });

  const formattedMessages = [];

  const history = messages.filter(
    (msg, idx) =>
      !(
        idx === messages.length - 1 &&
        msg.sender === "user" &&
        msg.message === userMessage
      )
  );

  for (const msg of history.slice(-10)) {
    const role = msg.sender === "user" ? "user" : "model";

    if (
      formattedMessages.length > 0 &&
      formattedMessages[formattedMessages.length - 1].role === role
    ) {
      formattedMessages[formattedMessages.length - 1].parts[0].text +=
        "\n" + msg.message;
    } else {
      formattedMessages.push({
        role,
        parts: [{ text: msg.message }]
      });
    }
  }

  if (
    formattedMessages.length > 0 &&
    formattedMessages[formattedMessages.length - 1].role === "user"
  ) {
    formattedMessages[formattedMessages.length - 1].parts[0].text +=
      "\n" + userMessage;
  } else {
    formattedMessages.push({
      role: "user",
      parts: [{ text: userMessage }]
    });
  }

  while (
    formattedMessages.length > 0 &&
    formattedMessages[0].role === "model"
  ) {
    formattedMessages.shift();
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
  ];

  for (const model of modelsToTry) {
    let retries = 2;
    let delay = 1000;

    while (retries > 0) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(
          url,
          {
            contents: formattedMessages,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 150
            }
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const aiText =
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I am here with you. Could you say that once more?";

        return aiText.trim();
      } catch (error) {
        const status = error.response?.status;
        const errorMessage =
          error.response?.data?.error?.message || error.message;

        console.warn(
          `Model ${model} failed with status ${status}: ${errorMessage}`
        );

        if (status === 429 && retries > 1) {
          await sleep(delay);
          retries--;
          delay *= 2;
        } else {
          break;
        }
      }
    }
  }

  throw new Error("All Gemini models failed or rate-limited.");
};

module.exports = {
  generateGeminiResponse
};