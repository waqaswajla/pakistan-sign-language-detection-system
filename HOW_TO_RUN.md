# How to Run LinguaSign

This project has two parts that must both be running at the same time, in **two separate terminals**:

- **Backend** — Python/FastAPI, does the actual sign detection (needs a Python 3.9–3.11 environment)
- **Frontend** — Next.js, the website you actually open in your browser

---

## 1. Clone the repository

```
git clone https://github.com/waqaswajla/pakistan-sign-language-detection-system.git
cd pakistan-sign-language-detection-system
```

---

## 2. Terminal #1 — Backend

Python **3.9, 3.10, or 3.11** is required — TensorFlow and MediaPipe don't support 3.12+ yet.

If you're using conda:

```
conda create -n psl_mp python=3.11
conda activate psl_mp
```

If you're not using conda, create a normal virtual environment instead:

```
python -m venv venv
venv\Scripts\activate
```

Then, every time, from inside the `backend` folder:

```
cd backend
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see `Uvicorn running on http://127.0.0.1:8000`. Leave this terminal open and running.

`pip install -r requirements.txt` only needs to be run once (or again if `requirements.txt` changes) — it downloads TensorFlow, MediaPipe and OpenCV, which takes a few minutes.

**Important:** `uvicorn main:app` only works while your terminal is inside the `backend` folder — it needs to find `main.py` right there. If you see `Error loading ASGI app. Could not import module "main"`, it means you ran the command from the wrong folder.

---

## 3. Terminal #2 — Frontend

Open a **new** terminal (no conda/Python environment needed here — this is Node.js).

```
cd pakistan-sign-language-detection-system\frontend
npm install
copy .env.example .env.local
npm run dev
```

`npm install` only needs to be run once. Once you see `Ready` and `Local: http://localhost:3000`, leave this terminal running too.

---

## 4. Open the app

Go to **http://localhost:3000** in your browser. Allow camera access when prompted.

Both terminals (backend and frontend) need to stay open while you use the app.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not import module "main"` | You ran `uvicorn` from the wrong folder — `cd` into `backend` first |
| `pip install` fails on TensorFlow/MediaPipe | Check your Python version is 3.9–3.11, not 3.12+ |
| Frontend loads but detection doesn't work | Make sure the backend terminal is still running on port 8000 |
| `'#' is not recognized...` in cmd.exe | You copied a comment line (starting with `#`) — those are for reference only, don't type them |
| Camera doesn't turn on | Check your browser has camera permission for `localhost:3000` |
