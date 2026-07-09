# QuizRush — a Kahoot-style live quiz app (MERN + Socket.io)

Hosts create quizzes and run them live. Players join from any device with a
6-digit game PIN and a nickname — no account needed. Questions are pushed to
everyone in real time, scoring rewards speed and accuracy, and there's a
leaderboard after every question plus a final results screen.

## Stack

- **MongoDB** + **Mongoose** — users and quizzes
- **Express** — REST API for auth and quiz CRUD
- **React** (Vite) + **Tailwind CSS** — frontend
- **Socket.io** — real-time lobby, questions, answers, scoring
- **JWT** — host authentication

## Project structure

```
quiz-app/
  server/       Express API + Socket.io server
  client/       React frontend (Vite)
```

## 1. Backend setup

```bash
cd server
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev               # or: npm start
```

Requires a running MongoDB instance (local `mongodb://localhost:27017/quizapp`
works out of the box, or use MongoDB Atlas — just update `MONGO_URI`).

The API + Socket.io server runs on **http://localhost:5000**.

## 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

The app runs on **http://localhost:5173**.

If your API isn't on localhost:5000, create `client/.env`:

```
VITE_API_URL=http://your-api-host:5000/api
VITE_SOCKET_URL=http://your-api-host:5000
```

## How it works

1. **Host** registers/logs in, builds a quiz (questions, options, correct
   answer, time limit, points) on the dashboard, then clicks **Host**.
2. The server generates a 6-digit **game PIN**. Players go to the home page,
   enter the PIN + a nickname, and land in the lobby.
3. Host clicks **Start** — the first question is pushed to every player with
   a countdown timer.
4. Players tap an answer; scoring is higher the faster a correct answer is
   locked in. Results are shown once everyone has answered or the timer runs
   out, followed by a running leaderboard.
5. After the last question, everyone sees the final leaderboard.

## Notes & next steps

- Live game state lives in server memory (`server/game/gameManager.js`), the
  same way Kahoot-style games work — a server restart ends in-progress games.
  Quizzes themselves are persisted in MongoDB.
- To harden for production: add rate limiting/validation on auth routes,
  persist finished game results/history, add reconnect support for dropped
  players, and deploy client + server behind HTTPS with proper CORS origins.
