import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/authService";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await signupUser(form);

      setMessage("Account created. Please check your email if confirmation is enabled.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Create account
        </h1>

        <p className="text-gray-500 mb-8">
          Start natural and professional prep conversations.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full name
            </label>
            <input
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-primary"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Signup"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
