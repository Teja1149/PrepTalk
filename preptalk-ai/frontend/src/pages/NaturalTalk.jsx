import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { createConversation } from "../services/conversationService";

const NaturalTalk = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = async () => {
      try {
        const conversation = await createConversation({
          mode: "natural",
          topic: null
        });

        navigate(`/conversation/${conversation.id}`, {
          state: {
            mode: "natural",
            topic: null
          }
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    start();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-soft">
      <Navbar />
      {loading ? (
        <Loader text="Starting natural talk..." />
      ) : (
        <div className="text-center mt-10 text-red-600">
          Failed to start conversation.
        </div>
      )}
    </div>
  );
};

export default NaturalTalk;
