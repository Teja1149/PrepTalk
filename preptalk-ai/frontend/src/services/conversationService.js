import axios from "axios";
import { supabase } from "./supabaseClient";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getAccessToken = async () => {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error("User is not logged in. Please login again.");
  }

  return session.access_token;
};

export const createConversation = async ({ mode, topic }) => {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${BACKEND_URL}/api/conversations`,
      {
        mode,
        topic
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.conversation;
  } catch (error) {
    console.error(
      "Create conversation failed:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const fetchConversations = async () => {
  const token = await getAccessToken();

  const response = await axios.get(`${BACKEND_URL}/api/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.conversations || [];
};

export const fetchMessages = async (conversationId) => {
  const token = await getAccessToken();

  const response = await axios.get(
    `${BACKEND_URL}/api/conversations/${conversationId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data.messages || [];
};

export const removeConversation = async (conversationId) => {
  const token = await getAccessToken();

  const response = await axios.delete(
    `${BACKEND_URL}/api/conversations/${conversationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};