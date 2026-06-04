import { ArrowRight } from "lucide-react";

const ModeCard = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 leading-relaxed mb-5">{description}</p>

      <div className="flex items-center gap-2 text-primary font-semibold">
        Start now <ArrowRight size={18} />
      </div>
    </button>
  );
};

export default ModeCard;
