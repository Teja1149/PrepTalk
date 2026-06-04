import { Link, useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { logoutUser } from "../services/authService";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const userName = user?.name || user?.email;

  return (
    <nav className="w-full px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-gray-100/40 flex items-center justify-between shadow-sm">
      <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg,#6C63FF,#FF6B8A)'}}>
          <Sparkles size={20} color="#fff" />
        </div>
        <span className="text-gray-900">PrepTalk AI</span>
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden md:block text-sm text-gray-500">
            {userName || user.email}
          </span>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2 rounded-xl bg-primary text-white"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
