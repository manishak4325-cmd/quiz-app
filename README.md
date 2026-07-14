# 🎯 Quiz App

A full-stack **real-time Quiz Application** inspired by platforms like **Kahoot** and **Wayground**, built using the **MERN Stack**. The application enables users to create quizzes, host live game sessions, and participate in interactive multiplayer quizzes with real-time updates powered by **Socket.IO**.

---

## 🌐 Live Deployments

- Frontend: https://quiz-app-delta-sandy-38.vercel.app/
- Backend: https://quizapp-hzh1.onrender.com

---

## 🚀 Features

* 🔐 Secure user registration and login using JWT Authentication
* 👤 User profile and authentication management
* 📝 Create, edit, and manage quizzes
* 🎮 Host live quiz sessions
* ⚡ Real-time multiplayer gameplay using Socket.IO
* 📊 Live score updates
* 💾 MongoDB database integration
* 📱 Responsive user interface built with React and Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* Bcrypt

### Database

* MongoDB
* Mongoose

---

## 📂 Project Structure

```text
quiz-app/
│
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Express backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── game/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## ✨ Key Functionalities

### Authentication

* User Registration
* User Login
* Password Encryption using Bcrypt
* JWT Token Authentication

### Quiz Management

* Create quizzes
* Edit quizzes
* Delete quizzes
* Store quiz data in MongoDB

### Live Gameplay

* Host quiz sessions
* Join quizzes using room codes
* Real-time communication with Socket.IO
* Instant score updates

---

## ⚙️ Prerequisites

Make sure you have installed:

* Node.js (v18 or later)
* npm
* MongoDB Community Server or MongoDB Atlas
* Git

---

# Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/manishak4325-cmd/quiz-app.git
cd quiz-app
```

---

## 2️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3️⃣ Install Frontend Dependencies

Open another terminal.

```bash
cd client
npm install
```

---

## 4️⃣ Configure Environment Variables

Inside the **server** folder, create a file named:

```text
.env
```

Add the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizapp
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note:** Do **not** commit your `.env` file to GitHub. Keep it private. Use `.env.example` as a template for other developers.

---

## ▶️ Run the Backend

```bash
cd server
npm run dev
```

Expected output:

```text
MongoDB Connected
Server running on Port 5000
```

---

## ▶️ Run the Frontend

```bash
cd client
npm run dev
```

Visit:

```text
http://localhost:5173
```

---

## 📁 Important Files

### Backend

| File                   | Description                   |
| ---------------------- | ----------------------------- |
| `server.js`            | Express server entry point    |
| `config/db.js`         | MongoDB connection            |
| `routes/authRoutes.js` | Authentication routes         |
| `routes/quizRoutes.js` | Quiz APIs                     |
| `middleware/auth.js`   | JWT authentication middleware |
| `models/User.js`       | User schema                   |
| `models/Quiz.js`       | Quiz schema                   |
| `sockets/`             | Socket.IO event handlers      |

### Frontend

| File                      | Description            |
| ------------------------- | ---------------------- |
| `main.jsx`                | React entry point      |
| `App.jsx`                 | Routing configuration  |
| `context/AuthContext.jsx` | Authentication context |
| `api/axios.js`            | Axios configuration    |
| `api/socket.js`           | Socket.IO client       |
| `pages/`                  | Application pages      |

---

## 🔒 Security

* Passwords are hashed using **Bcrypt**
* Authentication is handled with **JWT**
* Environment variables are stored securely in `.env`
* Sensitive files are excluded using `.gitignore`

---

## 🛣️ Future Enhancements

* ⏱️ Quiz timer
* 🏆 Global leaderboard
* 📈 Player analytics
* 🎵 Sound effects
* 📚 Quiz categories
* 🖼️ Image-based questions
* 🌙 Dark mode
* 👨‍💼 Admin dashboard
* 📱 Progressive Web App (PWA)

---

## 🐛 Troubleshooting

**MongoDB connection failed**

* Ensure MongoDB is running.
* Verify `MONGO_URI` in `.env`.

**Frontend cannot connect to backend**

* Check that the backend is running.
* Verify `CLIENT_URL` and API endpoints.

**Dependencies missing**

Run:

```bash
npm install
```

inside both the `client` and `server` folders.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

## 👩‍💻 Author

**Manisha Kumari**

GitHub: https://github.com/manishak4325-cmd

---

⭐ If you found this project helpful, consider giving it a **Star** on GitHub!
