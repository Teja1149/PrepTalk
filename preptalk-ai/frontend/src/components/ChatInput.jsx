import { useState } from "react";
import { Send } from "lucide-react";
import VoiceButton from "./VoiceButton";

const ChatInput = ({
  onSend,
  disabled,
  isListening,
  voiceStatus,
  onStartVoice,
  onStopVoice,
  interimText
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim() || disabled) return;

    onSend(input.trim());
    setInput("");
  };

  const getPlaceholder = () => {
    if (interimText) return interimText;
    if (voiceStatus === "starting") return "Starting microphone...";
    if (voiceStatus === "listening") return "Mic is on... speak naturally";
    if (voiceStatus === "processing") return "Understanding your voice...";
    return "Type or start voice conversation...";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-gray-200 rounded-3xl p-3 shadow-sm flex items-end gap-3"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={1}
        placeholder={getPlaceholder()}
        className="flex-1 resize-none outline-none px-3 py-3 text-gray-800"
        disabled={disabled || voiceStatus === "processing"}
      />

      <VoiceButton
        isListening={isListening}
        disabled={voiceStatus === "processing"}
        onStart={onStartVoice}
        onStop={onStopVoice}
      />

      <button
        type="submit"
        disabled={disabled || !input.trim() || voiceStatus === "processing"}
        className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatInput;