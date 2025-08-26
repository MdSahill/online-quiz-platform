import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.quizzes().then(d => setQuizzes(d.quizzes)).catch(e => setErr(e.message));
  }, []);

  if (err) return <div style={{color:"red"}}>{err}</div>;

  return (
    <div>
      <h2>Available Quizzes</h2>
      {quizzes.length === 0 ? <div>No quizzes yet</div> : (
        <ul>
          {quizzes.map(q => (
            <li key={q.id} style={{marginBottom:10}}>
              <strong>{q.title}</strong> — {q.description || "No description"} ({q.count} questions)
              <div><Link to={`/quiz/${q.id}`}>Take Quiz</Link> &nbsp;|&nbsp; <Link to={`/quiz/${q.id}?lb=1`}>Leaderboard</Link></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
