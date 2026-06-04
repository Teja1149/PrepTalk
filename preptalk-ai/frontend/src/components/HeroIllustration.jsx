import { motion } from "framer-motion";

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-72 h-96 rounded-3xl glass-card p-6 flex items-center justify-center shadow-2xl soft-elevate"
        aria-hidden
      >
        {/* Static SVG illustration */}
        <svg className="w-full h-full" viewBox="0 0 280 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="264" height="364" rx="22" fill="white" opacity="0.95" />
          <g transform="translate(24,40)">
            <circle cx="60" cy="40" r="28" fill="#6C63FF" opacity="0.14" />
            <rect x="0" y="88" width="200" height="10" rx="5" fill="#EAE8FF" />
            <rect x="0" y="108" width="160" height="10" rx="5" fill="#EAE8FF" />
            <rect x="0" y="128" width="120" height="10" rx="5" fill="#EAE8FF" />
            <rect x="0" y="160" width="220" height="70" rx="12" fill="#F8F9FF" />
            <path d="M160 40c12 0 22 10 22 22v70" stroke="#BFB8FF" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
            <g transform="translate(120,150)">
              <rect x="8" y="8" width="54" height="54" rx="10" fill="#6C63FF" />
              <rect x="-6" y="26" width="26" height="10" rx="5" fill="#FFFFFF" opacity="0.9" />
            </g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
