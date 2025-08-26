import React, { useState } from "react";
import { api } from "../api";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizId, setQuizId] = useState("");
  const [q, setQ] = useState({ text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:"A" });
  const [msg, setMsg] = useState("");

  const createQuiz = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.createQuiz({ title, description });
      setQuizId(res.id);
      setMsg(`Quiz created with ID ${res.id}`);
    } catch (e) { setMsg(e.message); }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      if (!quizId) throw new Error("Create/enter a quiz ID first");
      await api.addQuestion(quizId, q);
      setMsg("Question added");
      setQ({ text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:"A" });
    } catch (e) { setMsg(e.message); }
  };

  const toggle = async () => {
    try {
      if (!quizId) throw new Error("Enter quiz ID");
      const res = await api.toggleQuiz(quizId);
      setMsg(`Quiz ${res.id} active = ${res.is_active}`);
    } catch (e) { setMsg(e.message); }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      {msg && <div style={{color:"#333", marginBottom:8}}>{msg}</div>}

      <form onSubmit={createQuiz} style={{marginBottom:16}}>
        <h3>Create Quiz</h3>
        <div><input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required/></div>
        <div><textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
        <button type="submit">Create</button>
      </form>

      <div style={{marginBottom:16}}>
        <h3>Quiz ID</h3>
        <input placeholder="Quiz ID" value={quizId} onChange={(e)=>setQuizId(e.target.value)} />
        <button onClick={toggle} style={{marginLeft:8}}>Toggle Active</button>
      </div>

      <form onSubmit={addQuestion}>
        <h3>Add Question</h3>
        <div><textarea placeholder="Question text" value={q.text} onChange={(e)=>setQ({...q, text:e.target.value})} required/></div>
        <div><input placeholder="Option A" value={q.option_a} onChange={(e)=>setQ({...q, option_a:e.target.value})} required/></div>
        <div><input placeholder="Option B" value={q.option_b} onChange={(e)=>setQ({...q, option_b:e.target.value})} required/></div>
        <div><input placeholder="Option C" value={q.option_c} onChange={(e)=>setQ({...q, option_c:e.target.value})} required/></div>
        <div><input placeholder="Option D" value={q.option_d} onChange={(e)=>setQ({...q, option_d:e.target.value})} required/></div>
        <div>
          <label>Correct Option: </label>
          <select value={q.correct_option} onChange={(e)=>setQ({...q, correct_option:e.target.value})}>
            <option>A</option><option>B</option><option>C</option><option>D</option>
          </select>
        </div>
        <button type="submit">Add Question</button>
      </form>
    </div>
  );
}
