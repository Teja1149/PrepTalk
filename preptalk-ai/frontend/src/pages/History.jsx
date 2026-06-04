import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

import {
  fetchConversations,
  removeConversation
} from "../services/conversationService";

const History = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this conversation?");

    if (!confirmDelete) return;

    await removeConversation(id);
    loadConversations();
  };

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold mb-8">Conversation History</h1>

        {loading ? (
          <Loader />
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border text-gray-600">
            No conversations yet.
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border shadow-sm flex items-center justify-between"
              >
                <button
                  onClick={() =>
                    navigate(`/conversation/${item.id}`, {
                      state: {
                        mode: item.mode,
                        topic: item.topic
                      }
                    })
                  }
                  className="text-left"
                >
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.mode} •{" "}
                    {new Date(item.updated_at).toLocaleString()}
                  </p>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
