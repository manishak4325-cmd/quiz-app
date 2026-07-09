require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const registerSocketHandlers = require("./sockets");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
