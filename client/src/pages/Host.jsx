import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSocket } from "../api/socket";

const TILE_COLORS = ["bg-coral", "bg-sky", "bg-gold", "bg-lime", "bg-coral", "bg-sky"];

export default function Host() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [status, setStatus] = useState("connecting"); // connecting | lobby | question | results | over | error
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    const token = localStorage.getItem("token");

    socket.emit("host:create-game", { quizId, token }, (res) => {
      if (res?.error) {
        setError(res.error);
        setStatus("error");
        return;
      }
      setRoomCode(res.roomCode);
      setQuizTitle(res.quizTitle);
      setStatus("lobby");
    });

    socket.on("lobby:players", setPlayers);

    socket.on("question:new", (q) => {
      setResults(null);
      setQuestion(q);
      setTimeLeft(q.timeLimit);
      setStatus("question");
    });

    socket.on("question:results", (data) => {
      setResults(data);
      setStatus("results");
    });

    socket.on("game:over", (data) => {
      setResults(data);
      setStatus("over");
    });

    return () => {
      socket.off("lobby:players");
      socket.off("question:new");
      socket.off("question:results");
      socket.off("game:over");
    };
  }, [quizId]);

  useEffect(() => {
    if (status !== "question" || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, timeLeft]);

  function startGame() {
    socketRef.current.emit("host:start-game", { roomCode }, (res) => {
      if (res?.error) setError(res.error);
    });
  }

  function nextQuestion() {
    socketRef.current.emit("host:next-question", { roomCode }, (res) => {
      if (res?.error) setError(res.error);
    });
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-coral font-display text-xl">{error}</p>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60 font-display text-xl">Creating game…</p>
      </div>
    );
  }

  if (status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/60 font-body mb-2">{quizTitle}</p>
        <p className="text-white/60 font-body mb-2">Game PIN</p>
        <p className="font-display text-6xl font-extrabold text-gold mb-8 tracking-widest">
          {roomCode}
        </p>

        <div className="w-full max-w-md bg-panel rounded-2xl p-6 border-4 border-white/10 mb-6">
          <p className="text-white/50 text-sm mb-3">{players.length} player(s) joined</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {players.map((n) => (
              <span key={n} className="bg-ink px-3 py-1 rounded-full text-sm font-semibold">
                {n}
              </span>
            ))}
            {players.length === 0 && (
              <span className="text-white/40 text-sm">Waiting for players…</span>
            )}
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={players.length === 0}
          className="tile-btn bg-lime text-ink font-display font-bold text-xl px-10 py-4 rounded-xl shadow-pop disabled:opacity-40"
        >
          Start game
        </button>
      </div>
    );
  }

  if (status === "question" && question) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-white/50 mb-2">
          Question {question.index + 1} / {question.total}
        </p>
        <h2 className="font-display text-3xl font-bold mb-6 max-w-2xl">{question.text}</h2>
        <div className="font-display text-5xl font-extrabold text-gold mb-8">{timeLeft}</div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className={`${TILE_COLORS[i]} rounded-xl p-4 font-display font-bold text-ink shadow-pop`}
            >
              {opt}
            </div>
          ))}
        </div>
        <p className="text-white/40 mt-8 text-sm">Players are answering on their devices…</p>
      </div>
    );
  }

  if (status === "results" && results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="font-display text-2xl font-bold mb-6">Question results</h2>
        <div className="w-full max-w-md bg-panel rounded-2xl p-4 border-4 border-white/10 mb-6 space-y-2 max-h-96 overflow-y-auto">
          {results.results.map((r) => (
            <div
              key={r.socketId}
              className="flex items-center justify-between bg-ink rounded-lg px-3 py-2"
            >
              <span className="font-semibold">{r.nickname}</span>
              <span className={r.correct ? "text-lime" : "text-coral"}>
                {r.correct ? `+${r.gained}` : "0"} · {r.totalScore} pts
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={nextQuestion}
          className="tile-btn bg-sky text-ink font-display font-bold text-lg px-8 py-3 rounded-xl shadow-pop"
        >
          {results.isLastQuestion ? "See final results" : "Next question"}
        </button>
      </div>
    );
  }

  if (status === "over" && results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <h2 className="font-display text-3xl font-bold mb-6">🏆 Final leaderboard</h2>
        <div className="w-full max-w-md bg-panel rounded-2xl p-4 border-4 border-white/10 mb-8 space-y-2">
          {results.leaderboard.map((p, i) => (
            <div
              key={p.nickname}
              className="flex items-center justify-between bg-ink rounded-lg px-3 py-2"
            >
              <span className="font-semibold">
                {i + 1}. {p.nickname}
              </span>
              <span className="text-gold font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="tile-btn bg-lime text-ink font-display font-bold px-8 py-3 rounded-xl shadow-pop"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return null;
}
