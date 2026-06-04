import { Mic, MicOff } from "lucide-react";

const VoiceButton = ({ isListening, disabled, onStart, onStop }) => {
  const handleClick = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition disabled:opacity-50 ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
      title={isListening ? "Stop voice conversation" : "Start voice conversation"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceButton;