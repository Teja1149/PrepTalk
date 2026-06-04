import { Bot, User } from "lucide-react";

const ChatBubble = ({ sender, message }) => {
  const isUser = sender === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isUser ? "bg-primary text-white" : "bg-white text-primary border"
          }`}
        >
          {isUser ? <User size={19} /> : <Bot size={19} />}
        </div>

        <div
          className={`px-5 py-4 rounded-3xl shadow-sm whitespace-pre-wrap leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-tr-md"
              : "bg-white text-gray-800 border border-gray-100 rounded-tl-md"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
