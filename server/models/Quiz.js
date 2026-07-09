const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message: "A question needs between 2 and 6 options",
    },
  },
  correctIndex: { type: Number, required: true, min: 0 },
  timeLimit: { type: Number, default: 20 }, // seconds
  points: { type: Number, default: 1000 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "A quiz needs at least one question",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
