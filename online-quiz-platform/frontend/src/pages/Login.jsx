import React, { useState } from "react";
import { api, setToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      navigate("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={submit} style={{maxWidth:360}}>
      <h2>Login</h2>
      {err && <div style={{color:"red"}}>{err}</div>}
      <div>
        <label>Email</label><br/>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/>
      </div>
      <div>
        <label>Password</label><br/>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/>
      </div>
      <button type="submit" style={{marginTop:12}}>Login</button>
    </form>
  );
}
