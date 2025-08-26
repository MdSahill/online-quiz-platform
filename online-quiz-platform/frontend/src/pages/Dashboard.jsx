import React from "react";
import { Link } from "react-router-dom";
export default function Dashboard() {
  return (
    <div>
      <h1>Online Quiz & Learning Platform</h1>
      <p>Practice aptitude, DSA, SQL and more. Take quizzes and see your leaderboard rank.</p>
      <Link to="/quizzes">Browse Quizzes</Link>
    </div>
  );
}
