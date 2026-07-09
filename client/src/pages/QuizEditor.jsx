import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function blankQuestion() {
  return { text: "", options: ["", ""], correctIndex: 0, timeLimit: 20, points: 1000 };
}

export default function QuizEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.get(`/quizzes/${id}`).then((res) => {
      setTitle(res.data.title);
      setDescription(res.data.description || "");
      setQuestions(res.data.questions);
    });
  }, [id, isNew]);

  function updateQuestion(qi, patch) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateOption(qi, oi, value) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q
      )
    );
  }

  function addOption(qi) {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ""] } : q))
    );
  }

  function removeOption(qi, oi) {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== oi);
        const correctIndex = q.correctIndex >= options.length ? 0 : q.correctIndex;
        return { ...q, options, correctIndex };
      })
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, blankQuestion()]);
  }

  function removeQuestion(qi) {
    setQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== qi) : qs));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    for (const [i, q] of questions.entries()) {
      if (!q.text.trim()) return setError(`Question ${i + 1} needs text`);
      if (q.options.some((o) => !o.trim())) return setError(`Question ${i + 1} has an empty option`);
    }

    setSaving(true);
    try {
      const payload = { title, description, questions };
      if (isNew) {
        await api.post("/quizzes", payload);
      } else {
        await api.put(`/quizzes/${id}`, payload);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save quiz");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-6">
        {isNew ? "New quiz" : "Edit quiz"}
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-panel rounded-xl p-4 border-2 border-white/10">
          <label className="block text-sm font-semibold text-white/70 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-ink rounded-lg px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-gold"
          />
          <label className="block text-sm font-semibold text-white/70 mb-1">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-ink rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="bg-panel rounded-xl p-4 border-2 border-white/10">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold">Question {qi + 1}</p>
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className="text-white/40 hover:text-coral text-sm"
              >
                Remove
              </button>
            </div>

            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Question text"
              className="w-full bg-ink rounded-lg px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-sky"
            />

            <div className="space-y-2 mb-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, { correctIndex: oi })}
                    title="Mark as correct answer"
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 bg-ink rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-lime"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qi, oi)}
                      className="text-white/40 hover:text-coral text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-sky text-sm font-semibold"
                >
                  + Add option
                </button>
              )}
            </div>

            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                Time (s)
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={q.timeLimit}
                  onChange={(e) => updateQuestion(qi, { timeLimit: Number(e.target.value) })}
                  className="w-20 bg-ink rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-gold"
                />
              </label>
              <label className="flex items-center gap-2 text-white/70">
                Points
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={q.points}
                  onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) })}
                  className="w-24 bg-ink rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-gold"
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="tile-btn w-full bg-sky/80 text-ink font-display font-bold py-3 rounded-xl shadow-pop"
        >
          + Add question
        </button>

        {error && <p className="text-coral text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="tile-btn w-full bg-lime text-ink font-display font-bold text-lg py-3 rounded-xl shadow-pop disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save quiz"}
        </button>
      </form>
    </div>
  );
}
