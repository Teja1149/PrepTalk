import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createConversation } from "../services/conversationService";

const ProfessionalPrep = () => {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const startPrep = async (e) => {
    e.preventDefault();

    if (!topic.trim()) return;

    try {
      setLoading(true);

      const conversation = await createConversation({
        mode: "professional",
        topic: topic.trim()
      });

      navigate(`/conversation/${conversation.id}`, {
        state: {
          mode: "professional",
          topic: topic.trim()
        }
      });
    } catch (error) {
      console.error(error);
      alert("Failed to start professional prep.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border">
          <h1 className="text-4xl font-extrabold text-gray-950 mb-4">
            Professional Prep Talk
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Enter the topic you want to prepare. Example: React interview,
            Java viva, client meeting, presentation practice, group discussion,
            sales pitch, or English speaking.
          </p>

          <form onSubmit={startPrep} className="space-y-5">
            <div>
              <label className="block font-semibold mb-2">
                What do you want to prepare today?
              </label>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: React interview preparation"
                className="w-full px-5 py-4 rounded-2xl border outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              disabled={loading || !topic.trim()}
              className="px-7 py-4 bg-primary text-white rounded-2xl font-semibold disabled:opacity-60"
            >
              {loading ? "Starting..." : "Start Prep Talk"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalPrep;
