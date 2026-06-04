import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

import Navbar from "../components/Navbar";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import Loader from "../components/Loader";

import { fetchMessages } from "../services/conversationService";
import { sendChatMessage } from "../services/chatService";
import useSmartSpeech from "../hooks/useSmartSpeech";
import useVoiceRecognition from "../hooks/useVoiceRecognition";

const ConversationRoom = () => {
  const { conversationId } = useParams();
  const location = useLocation();

  const mode = location.state?.mode || "natural";
  const topic = location.state?.topic || null;

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [currentLanguageCode, setCurrentLanguageCode] = useState("en-IN");
  const [currentLanguageName, setCurrentLanguageName] = useState("English");

  const bottomRef = useRef(null);
  const isVoiceModeRef = useRef(false);
  const sendingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const welcomeSpokenRef = useRef(false);
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  const {
    isListening,
    voiceStatus,
    startListening,
    stopListening
  } = useVoiceRecognition({
    conversationId,
    mode,
    topic,

    onInterim: (text) => {
      setInterimText(text);
    },

    onFinal: async ({ transcript, reply, language, languageCode }) => {
      setInterimText("");

      const finalLanguageCode = languageCode || "en-IN";
      const finalLanguageName = language || "English";

      setCurrentLanguageCode(finalLanguageCode);
      setCurrentLanguageName(finalLanguageName);

      if (transcript) {
        const userMessage = {
          id: crypto.randomUUID(),
          sender: "user",
          message: transcript
        };

        setMessages((prev) => [...prev, userMessage]);
      }

      if (reply) {
        const aiMessage = {
          id: crypto.randomUUID(),
          sender: "ai",
          message: reply
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (voiceEnabled && !welcomeSpokenRef.current) {
  welcomeSpokenRef.current = true;
  await speak(welcome, currentLanguageCode, currentLanguageName);
        } else if (isVoiceModeRef.current) {
          setTimeout(() => {
            if (isVoiceModeRef.current) {
              startListening();
            }
          }, 700);
        }
      } else if (isVoiceModeRef.current) {
        setTimeout(() => {
          if (isVoiceModeRef.current) {
            startListening();
          }
        }, 900);
      }
    },

    onError: (message) => {
      setInterimText("");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          message:
            message ||
            "Sorry, I could not hear that clearly. Please speak once again."
        }
      ]);

      if (isVoiceModeRef.current) {
        setTimeout(() => {
          if (isVoiceModeRef.current && !sendingRef.current) {
            startListening();
          }
        }, 1200);
      }
    }
  });

  const { speak, stopSpeaking, isSpeaking } = useSmartSpeech({
    onEnd: () => {
      isSpeakingRef.current = false;

      if (isVoiceModeRef.current && !sendingRef.current) {
        setTimeout(() => {
          if (isVoiceModeRef.current && !sendingRef.current) {
            startListening();
          }
        }, 700);
      }
    }
  });

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages(conversationId);
        setMessages(data);

        if (data.length === 0) {
          const welcome =
            mode === "professional"
              ? `Great! Let's start your prep for ${topic}. Before we begin, tell me your current level: beginner, intermediate, or experienced?`
              : "Hi! I’m happy you’re here. What would you like to talk about today?";

          setMessages([
            {
              id: "welcome",
              sender: "ai",
              message: welcome
            }
          ]);

          if (voiceEnabled) {
            await speak(welcome, currentLanguageCode, currentLanguageName);
          }
        }
      } catch (error) {
        console.error("Load messages error:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, sending, isSpeaking, voiceStatus]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    setSending(true);
    sendingRef.current = true;

    stopListening({ processAudio: false });

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message: text
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await sendChatMessage({
        conversationId,
        message: text,
        mode,
        topic,
        language: currentLanguageName
      });

      const aiMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        message: response.reply
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (voiceEnabled) {
        await speak(response.reply, currentLanguageCode, currentLanguageName);
      }
    } catch (error) {
      console.error("Send message error:", error);

      const serverMessage =
        error.response?.data?.message ||
        "Sorry, I faced a small issue while replying. Can you try once again?";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          message: serverMessage
        }
      ]);

      setIsVoiceMode(false);
      isVoiceModeRef.current = false;
      stopListening({ processAudio: false });
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }

    setVoiceEnabled((prev) => !prev);
  };

  const startVoiceConversation = () => {
    if (sending || isSpeaking) return;

    stopSpeaking();

    setIsVoiceMode(true);
    isVoiceModeRef.current = true;

    setTimeout(() => {
      startListening();
    }, 300);
  };

  const stopVoiceConversation = () => {
    setIsVoiceMode(false);
    isVoiceModeRef.current = false;

    stopListening({ processAudio: false });
    stopSpeaking();
  };

  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="bg-white border rounded-3xl px-6 py-4 mb-5 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "professional"
                ? "Professional Prep Talk"
                : "Natural Talk"}
            </h1>

            <p className="text-sm text-gray-500">
              {mode === "professional"
                ? topic
                : "Friendly human-like conversation"}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Voice language: {currentLanguageName}
            </p>
          </div>

          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${
              voiceEnabled
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </button>
        </div>

        <div className="flex-1 bg-gradient-to-br from-white to-indigo-50 border rounded-[2rem] p-5 overflow-y-auto chat-scroll">
          {loadingMessages ? (
            <Loader text="Loading conversation..." />
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  sender={msg.sender}
                  message={msg.message}
                />
              ))}

              {sending && (
                <div className="text-sm text-gray-500 pl-2">
                  PrepTalk AI is thinking...
                </div>
              )}

              {isSpeaking && (
                <div className="text-sm text-primary pl-2">
                  Speaking response...
                </div>
              )}

              {voiceStatus === "starting" && (
                <div className="text-sm text-primary pl-2">
                  Starting microphone...
                </div>
              )}

              {voiceStatus === "listening" && (
                <div className="text-sm text-red-500 pl-2">
                  {interimText || "Listening... speak naturally"}
                </div>
              )}

              {voiceStatus === "processing" && (
                <div className="text-sm text-primary pl-2">
                  Understanding your voice...
                </div>
              )}

              <div ref={bottomRef}></div>
            </div>
          )}
        </div>

        <div className="mt-5">
          <ChatInput
            onSend={handleSend}
            disabled={sending}
            isListening={isListening}
            voiceStatus={voiceStatus}
            interimText={interimText}
            onStartVoice={startVoiceConversation}
            onStopVoice={stopVoiceConversation}
          />
        </div>
      </main>
    </div>
  );
};

export default ConversationRoom;