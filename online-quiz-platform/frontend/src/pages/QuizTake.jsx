import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useParams, useSearchParams } from "react-router-dom";

export default function QuizTake() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const showLb = sp.get("lb") === "1";

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [lb, setLb] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.quiz(id).then(setQuiz).catch(e => setErr(e.message));
    if (showLb) {
      api.leaderboard(id).then(d => setLb(d.leaderboard)).catch(()=>{});
    }
  }, [id, showLb]);

  const setAns = (qid, opt) => setAnswers(prev => ({...prev, [qid]: opt}));

  const submit = async () => {
    try {
      const res = await api.submit(id, answers);
      setResult(res);
      api.leaderboard(id).then(d => setLb(d.leaderboard)).catch(()=>{});
    } catch (e) { setErr(e.message); }
  };

  if (err) return <div style={{color:"red"}}>{err}</div>;
  if (!quiz) return <div>Loading...</div>;

  return (
    <div>
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>

      {!showLb && quiz.questions.map(q => (
        <div key={q.id} style={{padding:12, border:"1px solid #eee", borderRadius:8, marginBottom:12}}>
          <div><strong>Q{q.id}.</strong> {q.text}</div>
          <div style={{display:"grid",gap:8, marginTop:8}}>
            {Object.entries(q.options).map(([k,v]) => (
              <label key={k} style={{cursor:"pointer"}}>
                <input
                  type="radio"
                  name={`q_${q.id}`}
                  checked={(answers[q.id] || "") === k}
                  onChange={() => setAns(q.id, k)}
                /> {k}. {v}
              </label>
            ))}
          </div>
        </div>
      ))}

      {!showLb && <button onClick={submit}>Submit</button>}

      {result && <div style={{marginTop:12}}>
        <strong>Result:</strong> {result.score} / {result.total}
      </div>}

      {lb.length > 0 && (
        <div style={{marginTop:16}}>
          <h3>Leaderboard</h3>
          <ol>
            {lb.map((r, i) => (
              <li key={i}>{r.name}: {r.score}/{r.total}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
