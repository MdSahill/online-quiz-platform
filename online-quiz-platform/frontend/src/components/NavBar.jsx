import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

export default function NavBar({ user, setUser }) {
  const navigate = useNavigate();
  const logout = () => {
    clearToken();
    setUser(null);
    navigate("/login");
  };
  return (
    <nav style={{display:"flex",gap:16,padding:12,borderBottom:"1px solid #ddd",alignItems:"center"}}>
      <Link to="/">Home</Link>
      <Link to="/quizzes">Quizzes</Link>
      {user?.role === "admin" && <Link to="/admin">Admin</Link>}
      <div style={{marginLeft:"auto"}}>
        {user ? (
          <>
            <span style={{marginRight:12}}>Hi, {user.name} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{marginRight:12}}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
