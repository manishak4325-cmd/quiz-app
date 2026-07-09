const jwt = require("jsonwebtoken");
const Quiz = require("../models/Quiz");
const gm = require("../game/gameManager");

function publicQuestion(game) {
  const q = game.questions[game.currentIndex];
  return {
    index: game.currentIndex,
    total: game.questions.length,
    text: q.text,
    options: q.options,
    timeLimit: q.timeLimit,
  };
}

function lobbyPlayerList(game) {
  return [...game.players.values()].map((p) => p.nickname);
}

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    // ---------- HOST ----------
    socket.on("host:create-game", async ({ quizId, token }, ack) => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const quiz = await Quiz.findOne({ _id: quizId, owner: payload.userId });
        if (!quiz) return ack?.({ error: "Quiz not found" });

        const game = gm.createGame(quiz, socket.id);
        socket.join(game.roomCode);
        ack?.({ roomCode: game.roomCode, quizTitle: game.quizTitle });
      } catch (err) {
        ack?.({ error: "Could not start host session" });
      }
    });

    socket.on("host:start-game", ({ roomCode }, ack) => {
      const { game, error } = gm.startGame(roomCode);
      if (error) return ack?.({ error });

      io.to(roomCode).emit("question:new", publicQuestion(game));
      armTimer(io, roomCode);
      ack?.({ ok: true });
    });

    socket.on("host:next-question", ({ roomCode }, ack) => {
      const game = gm.getGame(roomCode);
      if (!game) return ack?.({ error: "Room not found" });
      if (game.status !== "results") return ack?.({ error: "Show results before moving on" });

      const { ended } = gm.advanceQuestion(roomCode);
      if (ended) {
        io.to(roomCode).emit("game:over", { leaderboard: gm.getLeaderboard(game) });
        return ack?.({ ok: true, ended: true });
      }

      io.to(roomCode).emit("question:new", publicQuestion(game));
      armTimer(io, roomCode);
      ack?.({ ok: true });
    });

    // ---------- PLAYER ----------
    socket.on("player:join", ({ roomCode, nickname }, ack) => {
      const trimmed = (nickname || "").trim().slice(0, 20);
      if (!trimmed) return ack?.({ error: "Enter a nickname" });

      const { game, error } = gm.joinGame(roomCode, socket.id, trimmed);
      if (error) return ack?.({ error });

      socket.join(roomCode);
      ack?.({ ok: true, quizTitle: game.quizTitle });
      io.to(roomCode).emit("lobby:players", lobbyPlayerList(game));
    });

    socket.on("player:answer", ({ roomCode, optionIndex }, ack) => {
      const { error } = gm.submitAnswer(roomCode, socket.id, optionIndex);
      if (error) return ack?.({ error });
      ack?.({ ok: true });

      const game = gm.getGame(roomCode);
      if (game && game.currentAnswers.size === game.players.size) {
        endQuestion(io, roomCode);
      }
    });

    // ---------- DISCONNECT ----------
    socket.on("disconnect", () => {
      const { role, roomCode } = gm.removeBySocketId(socket.id);
      if (!roomCode) return;

      if (role === "host") {
        io.to(roomCode).emit("game:host-left");
      } else if (role === "player") {
        const game = gm.getGame(roomCode);
        if (game) io.to(roomCode).emit("lobby:players", lobbyPlayerList(game));
      }
    });
  });

  function armTimer(io, roomCode) {
    const game = gm.getGame(roomCode);
    if (!game) return;
    if (game.timer) clearTimeout(game.timer);

    const q = game.questions[game.currentIndex];
    game.timer = setTimeout(() => endQuestion(io, roomCode), q.timeLimit * 1000 + 300);
  }

  function endQuestion(io, roomCode) {
    const game = gm.getGame(roomCode);
    if (!game || game.status !== "question") return;
    if (game.timer) clearTimeout(game.timer);

    const results = gm.scoreCurrentQuestion(game);
    const q = game.questions[game.currentIndex];
    io.to(roomCode).emit("question:results", {
      correctIndex: q.correctIndex,
      results,
      isLastQuestion: game.currentIndex === game.questions.length - 1,
    });
  }
}

module.exports = registerSocketHandlers;
