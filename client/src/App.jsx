import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import QuizEditor from "./pages/QuizEditor.jsx";
import Host from "./pages/Host.jsx";
import Play from "./pages/Play.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/play/:roomCode" element={<Play />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host/:quizId"
        element={
          <ProtectedRoute>
            <Host />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
