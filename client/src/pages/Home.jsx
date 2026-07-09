import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSocket } from "../api/socket";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  function handleJoin(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(roomCode)) {
      setError("Game PIN should be 6 digits");
      return;
    }
    if (!nickname.trim()) {
      setError("Enter a nickname");
      return;
    }

    setJoining(true);
    const socket = getSocket();
    socket.emit("player:join", { roomCode, nickname }, (res) => {
      setJoining(false);
      if (res?.error) {
        setError(res.error);
        return;
      }
      navigate(`/play/${roomCode}`, { state: { nickname, quizTitle: res.quizTitle } });
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white mb-2 tracking-tight">
        Quiz<span className="text-gold">Rush</span>
      </h1>
      <p className="text-white/60 mb-10 font-body">Live quizzes, played together.</p>

      <form
        onSubmit={handleJoin}
        className="w-full max-w-sm bg-panel rounded-2xl p-6 shadow-pop border-4 border-white/10"
      >
        <label className="block text-sm font-semibold text-white/70 mb-1">Game PIN</label>
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          className="w-full text-center text-2xl font-display tracking-widest bg-ink rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-gold"
        />

        <label className="block text-sm font-semibold text-white/70 mb-1">Nickname</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. QuizWhiz"
          maxLength={20}
          className="w-full bg-ink rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-gold"
        />

        {error && <p className="text-coral text-sm font-medium mb-3">{error}</p>}

        <button
          type="submit"
          disabled={joining}
          className="tile-btn w-full bg-lime text-ink font-display font-bold text-lg py-3 rounded-xl shadow-pop disabled:opacity-50"
        >
          {joining ? "Joining…" : "Enter"}
        </button>
      </form>

      <p className="mt-8 text-white/50 text-sm">
        Hosting a quiz?{" "}
        <Link to="/login" className="text-sky font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
