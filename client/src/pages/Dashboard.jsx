import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/quizzes")
      .then((res) => setQuizzes(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this quiz?")) return;
    await api.delete(`/quizzes/${id}`);
    setQuizzes((qs) => qs.filter((q) => q._id !== id));
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Your quizzes</h1>
          <p className="text-white/50 text-sm">Signed in as {user?.name}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-white/60 hover:text-coral text-sm font-semibold"
        >
          Log out
        </button>
      </div>

      <Link
        to="/quiz/new"
        className="tile-btn inline-block bg-lime text-ink font-display font-bold px-5 py-3 rounded-xl shadow-pop mb-8"
      >
        + New quiz
      </Link>

      {loading && <p className="text-white/50">Loading…</p>}

      {!loading && quizzes.length === 0 && (
        <p className="text-white/50">No quizzes yet. Create your first one above.</p>
      )}

      <div className="space-y-3">
        {quizzes.map((q) => (
          <div
            key={q._id}
            className="bg-panel rounded-xl p-4 flex items-center justify-between border-2 border-white/10"
          >
            <div>
              <p className="font-display font-bold text-lg">{q.title}</p>
              <p className="text-white/50 text-sm">{q.questionCount} questions</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/host/${q._id}`}
                className="tile-btn bg-coral text-white font-semibold px-4 py-2 rounded-lg shadow-pop text-sm"
              >
                Host
              </Link>
              <Link
                to={`/quiz/${q._id}`}
                className="tile-btn bg-sky text-ink font-semibold px-4 py-2 rounded-lg shadow-pop text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(q._id)}
                className="text-white/40 hover:text-coral px-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
