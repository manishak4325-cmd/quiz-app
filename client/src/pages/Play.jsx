import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getSocket } from "../api/socket";

const TILE_COLORS = ["bg-coral", "bg-sky", "bg-gold", "bg-lime", "bg-coral", "bg-sky"];

export default function Play() {
  const { roomCode } = useParams();
  const location = useLocation();
  const nickname = location.state?.nickname;
  const socketRef = useRef(null);

  const [status, setStatus] = useState("lobby"); // lobby | question | answered | results | over
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [finalLeaderboard, setFinalLeaderboard] = useState(null);
  const [hostLeft, setHostLeft] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("question:new", (q) => {
      setQuestion(q);
      setSelected(null);
      setMyResult(null);
      setTimeLeft(q.timeLimit);
      setStatus("question");
    });

    socket.on("question:results", (data) => {
      const mine = data.results.find((r) => r.socketId === socket.id);
      setMyResult({ ...mine, correctIndex: data.correctIndex });
      setStatus("results");
    });

    socket.on("game:over", (data) => {
      setFinalLeaderboard(data.leaderboard);
      setStatus("over");
    });

    socket.on("game:host-left", () => setHostLeft(true));

    return () => {
      socket.off("question:new");
      socket.off("question:results");
      socket.off("game:over");
      socket.off("game:host-left");
    };
  }, []);

  useEffect(() => {
    if (status !== "question" || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, timeLeft]);

  function submitAnswer(index) {
    if (selected !== null) return;
    setSelected(index);
    socketRef.current.emit("player:answer", { roomCode, optionIndex: index }, () => {});
    setStatus("answered");
  }

  if (hostLeft) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <p className="font-display text-2xl text-coral">The host ended this game.</p>
      </div>
    );
  }

  if (status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl font-bold mb-2">You're in, {nickname}!</p>
        <p className="text-white/50">Waiting for the host to start the game…</p>
      </div>
    );
  }

  if ((status === "question" || status === "answered") && question) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8">
        <div className="text-center mb-6">
          <p className="text-white/50 text-sm">
            Question {question.index + 1} / {question.total}
          </p>
          <h2 className="font-display text-2xl font-bold mt-1">{question.text}</h2>
          <p className="font-display text-3xl font-extrabold text-gold mt-2">{timeLeft}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => submitAnswer(i)}
              disabled={selected !== null}
              className={`tile-btn ${TILE_COLORS[i]} rounded-xl p-4 font-display font-bold text-ink shadow-pop text-lg ${
                selected === i ? "ring-4 ring-white" : ""
              } ${selected !== null && selected !== i ? "opacity-40" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {status === "answered" && (
          <p className="text-center text-white/50 mt-6">Answer locked in — waiting for others…</p>
        )}
      </div>
    );
  }

  if (status === "results" && myResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p
          className={`font-display text-4xl font-extrabold mb-3 ${
            myResult.correct ? "text-lime" : "text-coral"
          }`}
        >
          {myResult.correct ? "Correct!" : "Incorrect"}
        </p>
        {myResult.correct && (
          <p className="text-white/70 mb-4">+{myResult.gained} points</p>
        )}
        <p className="text-white/50">Total score: {myResult.totalScore ?? 0}</p>
        <p className="text-white/40 mt-6 text-sm">Waiting for the next question…</p>
      </div>
    );
  }

  if (status === "over" && finalLeaderboard) {
    const myRank = finalLeaderboard.findIndex((p) => p.nickname === nickname);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-3xl font-bold mb-2">Game over!</h2>
        {myRank >= 0 && (
          <p className="text-gold font-display text-xl mb-6">
            You finished #{myRank + 1} with {finalLeaderboard[myRank].score} points
          </p>
        )}
        <div className="w-full max-w-sm bg-panel rounded-2xl p-4 border-4 border-white/10 space-y-2">
          {finalLeaderboard.slice(0, 5).map((p, i) => (
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
      </div>
    );
  }

  return null;
}
