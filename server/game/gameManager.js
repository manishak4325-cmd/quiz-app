const { randomInt } = require("crypto");

// All live game state lives in memory. If the server restarts, live games
// are lost (this is standard for Kahoot-style ephemeral sessions).
const games = new Map(); // roomCode -> game object
const hostToRoom = new Map(); // hostSocketId -> roomCode
const playerToRoom = new Map(); // playerSocketId -> roomCode

function generateRoomCode() {
  let code;
  do {
    code = String(randomInt(100000, 999999));
  } while (games.has(code));
  return code;
}

function createGame(quiz, hostSocketId) {
  const roomCode = generateRoomCode();
  const game = {
    roomCode,
    hostSocketId,
    quizTitle: quiz.title,
    questions: quiz.questions.map((q) => ({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      timeLimit: q.timeLimit || 20,
      points: q.points || 1000,
    })),
    status: "lobby", // lobby | question | results | ended
    currentIndex: -1,
    players: new Map(), // socketId -> { nickname, score, streak }
    currentAnswers: new Map(), // socketId -> { optionIndex, answeredAt }
    questionStartedAt: null,
    timer: null,
  };
  games.set(roomCode, game);
  hostToRoom.set(hostSocketId, roomCode);
  return game;
}

function getGame(roomCode) {
  return games.get(roomCode);
}

function joinGame(roomCode, socketId, nickname) {
  const game = games.get(roomCode);
  if (!game) return { error: "Room not found" };
  if (game.status !== "lobby") return { error: "This game has already started" };

  const taken = [...game.players.values()].some(
    (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
  );
  if (taken) return { error: "That nickname is already taken in this room" };

  game.players.set(socketId, { nickname, score: 0, streak: 0 });
  playerToRoom.set(socketId, roomCode);
  return { game };
}

function startGame(roomCode) {
  const game = games.get(roomCode);
  if (!game) return { error: "Room not found" };
  if (game.players.size === 0) return { error: "No players have joined yet" };
  game.status = "question";
  game.currentIndex = 0;
  game.currentAnswers.clear();
  game.questionStartedAt = Date.now();
  return { game };
}

function advanceQuestion(roomCode) {
  const game = games.get(roomCode);
  if (!game) return { error: "Room not found" };
  game.currentIndex += 1;
  if (game.currentIndex >= game.questions.length) {
    game.status = "ended";
    return { game, ended: true };
  }
  game.status = "question";
  game.currentAnswers.clear();
  game.questionStartedAt = Date.now();
  return { game };
}

function submitAnswer(roomCode, socketId, optionIndex) {
  const game = games.get(roomCode);
  if (!game || game.status !== "question") return { error: "No active question" };
  if (!game.players.has(socketId)) return { error: "Player not in this game" };
  if (game.currentAnswers.has(socketId)) return { error: "Already answered" };

  game.currentAnswers.set(socketId, { optionIndex, answeredAt: Date.now() });
  return { game };
}

function scoreCurrentQuestion(game) {
  const q = game.questions[game.currentIndex];
  const results = [];

  for (const [socketId, player] of game.players.entries()) {
    const answer = game.currentAnswers.get(socketId);
    const isCorrect = !!answer && answer.optionIndex === q.correctIndex;

    let gained = 0;
    if (isCorrect) {
      const elapsedMs = answer.answeredAt - game.questionStartedAt;
      const elapsedSec = Math.max(0, elapsedMs / 1000);
      const speedFactor = Math.max(0, 1 - elapsedSec / (q.timeLimit * 2)); // slow decay
      gained = Math.round(q.points * (0.5 + 0.5 * speedFactor));
      player.streak += 1;
    } else {
      player.streak = 0;
    }

    player.score += gained;
    results.push({
      socketId,
      nickname: player.nickname,
      answeredIndex: answer ? answer.optionIndex : null,
      correct: isCorrect,
      gained,
      totalScore: player.score,
      streak: player.streak,
    });
  }

  game.status = "results";
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

function getLeaderboard(game) {
  return [...game.players.values()]
    .map((p) => ({ nickname: p.nickname, score: p.score, streak: p.streak }))
    .sort((a, b) => b.score - a.score);
}

function removeBySocketId(socketId) {
  const hostedRoom = hostToRoom.get(socketId);
  if (hostedRoom) {
    hostToRoom.delete(socketId);
    games.delete(hostedRoom);
    return { role: "host", roomCode: hostedRoom };
  }

  const joinedRoom = playerToRoom.get(socketId);
  if (joinedRoom) {
    playerToRoom.delete(socketId);
    const game = games.get(joinedRoom);
    if (game) game.players.delete(socketId);
    return { role: "player", roomCode: joinedRoom };
  }

  return { role: null };
}

module.exports = {
  createGame,
  getGame,
  joinGame,
  startGame,
  advanceQuestion,
  submitAnswer,
  scoreCurrentQuestion,
  getLeaderboard,
  removeBySocketId,
};
