# 🚀 PathPilot — AI-Powered Career Path & Skill Navigation Platform

PathPilot is an intelligent, multi-agent career navigation and upskilling platform. It assesses a learner's current capabilities against dynamic industry role requirements, calculates skill gaps, generates adaptive learning roadmaps, and provides interactive AI mentoring.

---

## 🌟 Key Features

- **🎯 Dynamic Career Tracks**: Explore structured industry career tracks (Data Scientist, AI/ML Engineer, Full Stack Developer, DevOps, Cybersecurity, Cloud Architect, Product Manager, etc.) with required skill trees and difficulty weights.
- **📝 Adaptive Skill Assessments**: Targeted multiple-choice assessments evaluating foundational and advanced competencies with real-time scoring.
- **📊 Comprehensive Skill Gap Analysis**: Visual radar charts, strength vs. growth area breakdowns, and personalized skill readiness scores.
- **🗺️ Personalized Learning Paths**: Dynamic step-by-step milestone roadmaps tailored to the learner's specific strengths and identified gaps.
- **💬 AI Career Copilot**: Context-aware AI assistant providing personalized career advice, curriculum clarification, and study strategies.
- **🔄 Learner Feedback Loop**: Interactive feedback triggers real-time dynamic adjustments to learning path milestones and pacing.
- **🏆 Gamification & Leaderboard**: XP, streak counters, milestone badges, and community leaderboard tracking.
- **🔐 Secure Firebase Authentication**: Persistent user identity keyed to Firebase UID with zero custom JWT risks.
- **💾 Production-Ready MongoDB Persistence**: Complete session state, assessment submissions, user skill profiles, and learning paths survive server restarts.

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌────────────────────────┐
                                  │      React + Vite      │
                                  │   (Tailwind, Lucide)   │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                  ┌────────────────────────┐
                                  │    FastAPI Backend     │
                                  │ (Python 3.10+ / Async) │
                                  └─────┬────────────┬─────┘
                                        │            │
                   ┌────────────────────▼──┐      ┌──▼────────────────────┐
                   │  Firebase Admin SDK   │      │   MongoDB Persistence │
                   │ (verify_id_token/UID) │      │ (Motor / PyMongo / DB)│
                   └───────────────────────┘      └───────────────────────┘
```

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python Web Framework)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Motor](https://motor.readthedocs.io/) & [PyMongo](https://pymongo.readthedocs.io/)
- **Authentication**: [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) (Token verification & stable UID identity)
- **AI / Logic**: Multi-agent simulation (Profile Agent, Assessment Agent, Recommendation Agent, Feedback Agent)
- **Testing**: `pytest` & `anyio`

### **Frontend**
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & UI**: [Lucide React](https://lucide.dev/), Canvas Radar Charts, Interactive Drawers & Heatmaps
- **Routing**: React State / Page Router

---

## 📂 Project Structure

```
HCL-Project/
├── backend/
│   ├── database/
│   │   ├── mongodb.py           # Motor async client connection & lifecycle management
│   │   ├── indexes.py           # Index creation for all collections
│   │   └── seed.py              # Idempotent career & course catalog seeder
│   ├── repositories/
│   │   ├── user_repository.py          # Users collection management (Firebase UID)
│   │   ├── session_repository.py       # Sessions persistence & lookup
│   │   ├── assessment_repository.py    # Assessments & submitted answers
│   │   ├── skill_repository.py         # Skill evaluations & user profiles
│   │   ├── learning_path_repository.py # Milestone learning paths
│   │   ├── feedback_repository.py      # Milestone feedback records
│   │   ├── career_repository.py        # Career tracks & skill metadata
│   │   ├── course_repository.py        # Course catalogue
│   │   └── agent_trace_repository.py   # AI agent audit trail
│   ├── services/
│   │   ├── scoring.py           # Assessment grading & topic strength classification
│   │   ├── recommendation.py    # Gap-based milestone recommendation engine
│   │   └── chatbot.py           # Contextual AI chatbot response engine
│   ├── tests/
│   │   └── test_mongodb.py      # 14-step persistence & auth test suite
│   ├── auth.py                  # Firebase token verification & dependency injection
│   ├── database.py              # Central database export wrapper
│   ├── main.py                  # FastAPI application routes & lifespan handler
│   ├── seed_data.py             # Pre-configured careers, skills & question bank
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, RadarChart, Heatmap, Modals
│   │   ├── context/             # AuthContext (Firebase auth provider)
│   │   ├── pages/               # Landing, Career Selection, Assessment, Skill Report, Dashboard
│   │   ├── services/            # Axios API clients & Market Intelligence
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Application shell
│   │   └── main.tsx             # React DOM entry point
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tailwind.config.js       # Custom design system & color tokens
│   └── vite.config.ts           # Vite configuration
├── .gitignore                   # Ignored artifacts, credentials & data dirs
└── README.md                    # Project documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Local instance running at `mongodb://localhost:27017` or MongoDB Atlas URI)

---

### 1. Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Update `MONGODB_URI`, `MONGODB_DATABASE`, or Firebase credentials if running with live Firebase service account)*

5. Start MongoDB service:
   ```powershell
   # Windows PowerShell (as Admin):
   Start-Service -Name MongoDB
   ```

6. Start FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   - Interactive Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Alternative Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup

1. Open a new terminal in `frontend/`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing & Verification

Run the full automated test suite verifying MongoDB persistence, idempotent seeding, session survival across server restarts, and Firebase identity validation:

```bash
# From the project root
python -m pytest backend/tests/test_mongodb.py -s
```

Or run directly:
```bash
python backend/tests/test_mongodb.py
```

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server & MongoDB connection health check |
| `GET` | `/careers` | List all available career tracks & skills |
| `GET` | `/careers/{career_id}` | Retrieve details for a specific career track |
| `POST` | `/session/start` | Initialize or resume active learner session |
| `POST` | `/session/{session_id}/career` | Select target career track for the session |
| `POST` | `/assessment/start` | Generate tailored assessment question bank |
| `POST` | `/assessment/{assessment_id}/submit` | Submit answers, calculate score & generate path |
| `GET` | `/session/{session_id}/assessment/result` | Fetch assessment evaluation & scores |
| `GET` | `/session/{session_id}/skills` | Retrieve session skill breakdown |
| `GET` | `/session/{session_id}/path` | Fetch personalized milestone learning roadmap |
| `POST` | `/session/{session_id}/feedback` | Submit milestone feedback to adjust difficulty |
| `POST` | `/chat` | Chat with AI Career Copilot |
| `GET` | `/session/{session_id}/trace` | Audit log of AI agent actions |

---

## 🛡️ Authentication Model

- Authenticated users authenticate via **Firebase Authentication** on the frontend.
- Backend validates tokens with `firebase_admin.auth.verify_id_token()` extracting `uid`.
- Data is partitioned by `firebase_uid`.
- Includes built-in `DEV_MODE=true` offline fallback for seamless local testing without mandatory cloud credentials.

---

## 📄 License

This project is licensed under the MIT License.
