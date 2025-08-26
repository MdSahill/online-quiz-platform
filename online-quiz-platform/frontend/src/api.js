const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token") || "";
}
export function setToken(t) {
  localStorage.setItem("token", t);
}
export function clearToken() {
  localStorage.removeItem("token");
}

async function http(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  health: () => http("/health", { auth: false }),
  register: (payload) => http("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => http("/api/auth/login", { method: "POST", body: payload, auth: false }),
  quizzes: () => http("/api/quizzes"),
  quiz: (id) => http(`/api/quizzes/${id}`),
  submit: (id, answers) => http(`/api/quizzes/${id}/submit`, { method: "POST", body: { answers } }),
  leaderboard: (id) => http(`/api/quizzes/${id}/leaderboard`),
  // admin
  createQuiz: (payload) => http("/api/admin/quizzes", { method: "POST", body: payload }),
  addQuestion: (quizId, payload) => http(`/api/admin/quizzes/${quizId}/questions`, { method: "POST", body: payload }),
  toggleQuiz: (quizId) => http(`/api/admin/quizzes/${quizId}/toggle`, { method: "PATCH" }),
};
