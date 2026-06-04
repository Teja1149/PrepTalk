import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await loginUser(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome back
        </h1>

        <p className="text-gray-500 mb-8">
          Login and continue your PrepTalk conversation.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          New here?{" "}
          <Link to="/signup" className="text-primary font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
