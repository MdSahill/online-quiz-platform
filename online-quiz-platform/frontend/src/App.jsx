import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { api, setToken, getToken } from "./api.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import QuizList from "./pages/QuizList.jsx";
import QuizTake from "./pages/QuizTake.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Restore session on reload by pinging a protected endpoint if token exists
  useEffect(() => {
    const boot = async () => {
      if (!getToken()) return;
      try {
        await api.health(); // simple ping
        // not ideal, but you can stash decoded info in token on backend;
        // here we rely on Login/Register response to set user normally.
      } catch {
        // invalid token
      }
    };
    boot();
  }, []);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quizzes" element={
            <ProtectedRoute user={user}>
              <QuizList />
            </ProtectedRoute>
          }/>
          <Route path="/quiz/:id" element={
            <ProtectedRoute user={user}>
              <QuizTake />
            </ProtectedRoute>
          }/>
          <Route path="/admin" element={
            <ProtectedRoute user={user} role="admin">
              <Admin />
            </ProtectedRoute>
          }/>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="*" element={<div>404 Not Found <Link to="/">Go Home</Link></div>} />
        </Routes>
      </div>
    </div>
  );
}
