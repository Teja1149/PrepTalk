import axios from "axios";
import { supabase } from "./supabaseClient";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getAccessToken = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User session not found");
  }

  return session.access_token;
};

export const generateSarvamSpeech = async ({
  text,
  languageCode,
  languageName
}) => {
  const token = await getAccessToken();

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/tts/speak`,
      {
        text,
        languageCode,
        languageName
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 40000
      }
    );

    return response.data;
  } catch (error) {
    console.error("TTS service error response:", error.response?.data);

    throw error;
  }
};