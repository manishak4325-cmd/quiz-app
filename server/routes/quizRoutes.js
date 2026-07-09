const express = require("express");
const Quiz = require("../models/Quiz");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// List quizzes owned by the logged-in user
router.get("/", async (req, res) => {
  const quizzes = await Quiz.find({ owner: req.userId })
    .select("title description questions createdAt")
    .sort({ createdAt: -1 });
  const withCounts = quizzes.map((q) => ({
    _id: q._id,
    title: q.title,
    description: q.description,
    questionCount: q.questions.length,
    createdAt: q.createdAt,
  }));
  res.json(withCounts);
});

// Get one quiz (full detail, for editing/hosting)
router.get("/:id", async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, owner: req.userId });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json(quiz);
});

// Create quiz
router.post("/", async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.create({
      title,
      description,
      questions,
      owner: req.userId,
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Could not create quiz", error: err.message });
  }
});

// Update quiz
router.put("/:id", async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, description, questions },
      { new: true, runValidators: true }
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Could not update quiz", error: err.message });
  }
});

// Delete quiz
router.delete("/:id", async (req, res) => {
  const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  res.json({ message: "Quiz deleted" });
});

module.exports = router;
