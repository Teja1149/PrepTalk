import { useNavigate } from "react-router-dom";
import { MessageCircle, Mic, Target } from "lucide-react";

import Navbar from "../components/Navbar";
import ModeCard from "../components/ModeCard";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-950 mb-3">
            Hello, {user?.user_metadata?.full_name || "there"} 👋
          </h1>

          <p className="text-gray-600 text-lg">
            Choose how you want to talk today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-7 mb-10">
          <ModeCard
            icon={<MessageCircle size={28} />}
            title="Natural Talk"
            description="Talk freely with a friendly AI companion about your thoughts, confidence, learning, career, or daily life."
            onClick={() => navigate("/natural-talk")}
          />

          <ModeCard
            icon={<Target size={28} />}
            title="Professional Prep Talk"
            description="Prepare for interviews, presentations, viva, meetings, group discussions, and career conversations."
            onClick={() => navigate("/professional-prep")}
          />
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Mic className="text-primary" />
            <h2 className="text-xl font-bold">Voice supported</h2>
          </div>
          <p className="text-gray-600">
            You can type your message or use the microphone to talk naturally.
            AI replies can also be spoken aloud.
          </p>

          <button
            onClick={() => navigate("/history")}
            className="mt-5 px-5 py-3 bg-gray-100 rounded-2xl font-semibold text-gray-700"
          >
            View Conversation History
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
