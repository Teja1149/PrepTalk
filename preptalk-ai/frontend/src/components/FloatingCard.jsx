import { motion } from 'framer-motion';

export default function FloatingCard({ title, text, icon, onClick, to, ariaLabel, className = "" }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick && onClick();
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || title}
      onKeyDown={handleKeyDown}
      onClick={() => onClick && onClick()}
      className={`bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-100/50 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 hover:shadow-2xl transition-shadow duration-300 ${className}`}
      initial={{ y: 6 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.04, y: -4 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50/80 flex items-center justify-center text-primary text-lg font-bold shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-bold text-gray-900 text-base">{title}</div>
          <div className="text-sm text-gray-600 mt-1 leading-relaxed">{text}</div>
        </div>
      </div>
    </motion.div>
  );
}
