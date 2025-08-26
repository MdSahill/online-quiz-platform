import os

# Define the folder structure
structure = {
    "online-quiz-platform": {
        "README.md": "",
        "backend": {
            "app.py": "",
            "models.py": "",
            "auth.py": "",
            "requirements.txt": "",
            ".env.example": ""
        },
        "frontend": {
            "index.html": "",
            "package.json": "",
            "vite.config.js": "",
            ".env.example": "",
            "src": {
                "main.jsx": "",
                "App.jsx": "",
                "api.js": "",
                "components": {
                    "NavBar.jsx": "",
                    "ProtectedRoute.jsx": ""
                },
                "pages": {
                    "Login.jsx": "",
                    "Register.jsx": "",
                    "Dashboard.jsx": "",
                    "QuizList.jsx": "",
                    "QuizTake.jsx": "",
                    "Admin.jsx": ""
                }
            }
        }
    }
}


def create_structure(base_path, structure_dict):
    """
    Recursively create folders and files from structure dict
    """
    for name, content in structure_dict.items():
        path = os.path.join(base_path, name)

        if isinstance(content, dict):  # It's a folder
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:  # It's a file
            with open(path, "w") as f:
                f.write(content)


if __name__ == "__main__":
    create_structure(".", structure)
    print("✅ Project structure created successfully!")
