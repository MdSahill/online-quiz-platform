import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from models import SessionLocal, init_db, User, Quiz, Question, Attempt
from auth import hash_password, verify_password, create_token, decode_token

load_dotenv()
init_db()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def auth_required(fn):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
            request.user = payload  # {"id":..., "email":..., "role":...}
        except Exception as e:
            return jsonify({"error": "Invalid/expired token"}), 401
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

def admin_required(fn):
    @auth_required
    def inner(*args, **kwargs):
        if request.user.get("role") != "admin":
            return jsonify({"error": "Admin only"}), 403
        return fn(*args, **kwargs)
    inner.__name__ = fn.__name__
    return inner

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------- Auth ----------
@app.post("/api/auth/register")
def register():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "student")
    if not all([name, email, password]):
        return {"error": "Missing fields"}, 400

    with next(get_db()) as db:
        try:
            user = User(name=name, email=email, password_hash=hash_password(password), role=role)
            db.add(user)
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            return {"error": "Email already registered"}, 409

    token = create_token({"id": user.id, "email": user.email, "role": user.role})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@app.post("/api/auth/login")
def login():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    with next(get_db()) as db:
        user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
        if not user or not verify_password(password, user.password_hash):
            return {"error": "Invalid credentials"}, 401

    token = create_token({"id": user.id, "email": user.email, "role": user.role})
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

# ---------- Quizzes (Student) ----------
@app.get("/api/quizzes")
@auth_required
def list_quizzes():
    with next(get_db()) as db:
        quizzes = db.execute(select(Quiz).where(Quiz.is_active == True).order_by(Quiz.created_at.desc())).scalars().all()
        return {"quizzes": [{"id": q.id, "title": q.title, "description": q.description, "count": len(q.questions)} for q in quizzes]}

@app.get("/api/quizzes/<int:quiz_id>")
@auth_required
def get_quiz(quiz_id):
    with next(get_db()) as db:
        quiz = db.get(Quiz, quiz_id)
        if not quiz or not quiz.is_active:
            return {"error": "Quiz not found"}, 404
        questions = [{
            "id": qu.id,
            "text": qu.text,
            "options": {"A": qu.option_a, "B": qu.option_b, "C": qu.option_c, "D": qu.option_d}
        } for qu in quiz.questions]
        return {"id": quiz.id, "title": quiz.title, "description": quiz.description, "questions": questions}

@app.post("/api/quizzes/<int:quiz_id>/submit")
@auth_required
def submit_quiz(quiz_id):
    data = request.get_json(force=True)
    answers = data.get("answers", {})  # {questionId: "A"/"B"/"C"/"D"}

    with next(get_db()) as db:
        quiz = db.get(Quiz, quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        total = len(quiz.questions)
        score = 0
        for q in quiz.questions:
            if str(q.id) in answers and answers[str(q.id)].upper() == q.correct_option:
                score += 1
        attempt = Attempt(quiz_id=quiz.id, user_id=request.user["id"], score=score, total=total)
        db.add(attempt)
        db.commit()
        return {"score": score, "total": total}

@app.get("/api/quizzes/<int:quiz_id>/leaderboard")
@auth_required
def leaderboard(quiz_id):
    with next(get_db()) as db:
        rows = db.execute(
            select(Attempt, User.name)
            .join(User, User.id == Attempt.user_id)
            .where(Attempt.quiz_id == quiz_id)
            .order_by(Attempt.score.desc(), Attempt.created_at.asc())
        ).all()
        lb = [{"name": name, "score": att.score, "total": att.total, "attempted_at": att.created_at.isoformat()} for att, name in rows]
        return {"leaderboard": lb}

# ---------- Admin ----------
@app.post("/api/admin/quizzes")
@admin_required
def admin_create_quiz():
    data = request.get_json(force=True)
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    if not title:
        return {"error": "Title required"}, 400
    with next(get_db()) as db:
        quiz = Quiz(title=title, description=description or "")
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return {"id": quiz.id, "title": quiz.title, "description": quiz.description}

@app.post("/api/admin/quizzes/<int:quiz_id>/questions")
@admin_required
def admin_add_question(quiz_id):
    data = request.get_json(force=True)
    required = ["text", "option_a", "option_b", "option_c", "option_d", "correct_option"]
    if not all(k in data and str(data[k]).strip() for k in required):
        return {"error": "Missing question fields"}, 400
    if data["correct_option"].upper() not in ["A", "B", "C", "D"]:
        return {"error": "correct_option must be one of A/B/C/D"}, 400
    with next(get_db()) as db:
        quiz = db.get(Quiz, quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        q = Question(
            quiz_id=quiz.id,
            text=data["text"].strip(),
            option_a=data["option_a"].strip(),
            option_b=data["option_b"].strip(),
            option_c=data["option_c"].strip(),
            option_d=data["option_d"].strip(),
            correct_option=data["correct_option"].upper()
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        return {"id": q.id}

@app.patch("/api/admin/quizzes/<int:quiz_id>/toggle")
@admin_required
def admin_toggle_quiz(quiz_id):
    with next(get_db()) as db:
        quiz = db.get(Quiz, quiz_id)
        if not quiz:
            return {"error": "Quiz not found"}, 404
        quiz.is_active = not quiz.is_active
        db.commit()
        return {"id": quiz.id, "is_active": quiz.is_active}

if __name__ == "__main__":
    app.run(port=5000, debug=True)
