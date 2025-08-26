import React, { useState } from "react";
import { api, setToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student"); // allow admin for demo
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.register({ name, email, password, role });
      setToken(res.token);
      setUser(res.user);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={submit} style={{maxWidth:360}}>
      <h2>Register</h2>
      {err && <div style={{color:"red"}}>{err}</div>}
      <div>
        <label>Name</label><br/>
        <input value={name} onChange={(e)=>setName(e.target.value)} required/>
      </div>
      <div>
        <label>Email</label><br/>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/>
      </div>
      <div>
        <label>Password</label><br/>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/>
      </div>
      <div>
        <label>Role</label><br/>
        <select value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin (demo)</option>
        </select>
      </div>
      <button type="submit" style={{marginTop:12}}>Create Account</button>
    </form>
  );
}
