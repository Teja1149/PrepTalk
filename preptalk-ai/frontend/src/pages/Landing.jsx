import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Mic, Sparkles, Target, Volume2, ShieldCheck, BarChart3, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import FloatingCard from "../components/FloatingCard";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafbfe] relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-primary/10 to-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-[-100px] w-[600px] h-[600px] bg-gradient-to-br from-secondary/10 to-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
        style={{
          backgroundImage: `radial-gradient(#111827 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Content - Left */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary font-bold text-sm mb-6"
            >
              <Sparkles size={16} className="text-primary" />
              <span>Next-Gen AI Conversation Partner</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900 mb-6 tracking-tight"
            >
              Practice conversations that build{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                real confidence
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl"
            >
              Speak naturally, receive instant structured feedback, and master interviews, public speaking, or casual chats with a supportive AI tutor.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link 
                to="/signup" 
                className="btn-animated animated rounded-2xl font-bold shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group px-8 py-4"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Try Demo
              </Link>
            </motion.div>
          </div>

          {/* Staggered Visual Showcase - Right */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full mt-10 lg:mt-0 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-[80px] -z-10" />

            <div className="flex flex-col gap-6 w-full max-w-sm">
              <FloatingCard
                title="Voice Conversation"
                text="Speak naturally, get auto-evaluated, and hear real-time AI responses spoken back clearly."
                icon={<Mic className="w-6 h-6 text-primary" />}
                onClick={() => navigate('/natural-talk')}
                ariaLabel="Open voice conversation"
                className="w-full transform lg:-translate-x-6 rotate-[-1.5deg] border-l-4 border-l-primary"
              />

              <FloatingCard
                title="Professional Prep"
                text="Polish your behavior for hard interviews, presentations, group discussions, and high-stakes meetings."
                icon={<Target className="w-6 h-6 text-accent" />}
                onClick={() => navigate('/professional-prep')}
                ariaLabel="Open professional prep"
                className="w-full transform lg:translate-x-4 rotate-[1deg] border-l-4 border-l-accent"
              />

              <FloatingCard
                title="Natural Talk"
                text="Have relaxed, friendly voice conversations about daily activities, lifestyle, or practice casual small talk."
                icon={<MessageCircle className="w-6 h-6 text-secondary" />}
                onClick={() => navigate('/natural-talk')}
                ariaLabel="Open natural talk"
                className="w-full transform lg:-translate-x-2 rotate-[-0.8deg] border-l-4 border-l-secondary"
              />
            </div>
          </div>
        </section>

        {/* Features Showcase Section */}
        <section className="bg-white border-y border-gray-100 py-20 px-6 relative">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mb-3 tracking-tight">
              Everything you need to speak fluently
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-16">
              Empower your communication skills with cutting-edge tools designed for voice learning.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-soft border border-gray-100/80 text-left hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Volume2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Live Speech Output</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Hear responses read out loud with natural voice synthesis, supporting pronunciation and listening practice.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-soft border border-gray-100/80 text-left hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Private & Encouraging</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Practice in a zero-pressure, judgment-free zone. Gain confidence privately at your own speed.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-soft border border-gray-100/80 text-left hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Logging</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Review complete transcripts of past chats, track corrections, and evaluate improvement areas over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Block */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="p-12 sm:p-16 rounded-[40px] bg-gradient-to-tr from-gray-950 to-gray-900 text-white relative overflow-hidden shadow-2xl">
            {/* Ambient gradients */}
            <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                Ready to level up your speaking skills?
              </h2>
              <p className="text-gray-300 text-base sm:text-lg mb-10 leading-relaxed">
                Join PrepTalk AI today. Speak with confidence, practice interviews, and communicate effectively in any setting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-950 font-bold rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Start For Free
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 border border-gray-700 text-white font-bold rounded-2xl hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Sparkles size={18} className="text-primary" />
              <span>PrepTalk AI</span>
            </div>
            <div>
              &copy; {new Date().getFullYear()} PrepTalk AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
