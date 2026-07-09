import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-panel rounded-2xl p-6 shadow-pop border-4 border-white/10"
      >
        <h1 className="font-display text-3xl font-bold mb-6 text-center">Create host account</h1>

        <label className="block text-sm font-semibold text-white/70 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-ink rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-gold"
        />

        <label className="block text-sm font-semibold text-white/70 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-ink rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-gold"
        />

        <label className="block text-sm font-semibold text-white/70 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          className="w-full bg-ink rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-gold"
        />

        {error && <p className="text-coral text-sm font-medium mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="tile-btn w-full bg-gold text-ink font-display font-bold text-lg py-3 rounded-xl shadow-pop disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>

        <p className="text-center text-white/50 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-sky font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
