# ⚔️ AlgoSiege

**The Real-Time Competitive Code Assessment Platform.**

AlgoSiege transforms how developers master algorithm efficiency. Instead of isolated, static test cases where "just making it work" is enough, AlgoSiege introduces a gamified, peer-to-peer arena. Here, your code's **Time and Space Complexity** are your weapons, and optimization is the only way to win.

Built for **ACE(M) Hack | CodeFest 2.0** by Team **HustLers**.

---

## 🛑 The Problem: The Optimization Gap
Current competitive coding platforms evaluate code on a binary scale: Pass or Fail. 
* **Complexity is Ignored:** Time and space efficiency are treated as afterthoughts.
* **Bad Habits:** Developers are rewarded for brute-force, resource-heavy spaghetti code as long as it passes hidden tests.
* **Zero Gamification:** There are no thrilling incentives to refactor or optimize.

## 🟢 The Solution: Battle of Code Efficiency
AlgoSiege is a 1v1 multiplayer coding arena where optimization is the win condition. We evaluate *how well* the code runs, not just *if* it runs.

### 🔥 Key Combat Mechanics
* **Efficiency-First Scoring:** Attack damage is calculated dynamically based on Big-O complexity. An $O(1)$ solution drops a nuke; an $O(n^2)$ solution barely makes a scratch.
* **Space Complexity (Stamina):** Solutions that hoard memory apply a "Bleed" effect to your own health bar. 
* **Clean Code Multiplier:** Modular code with standard naming conventions grants a Critical Strike multiplier.
* **Live Performance Stats:** Real-time tracking of memory usage and execution bottlenecks.

---

## 🛠️ Tech Stack & Architecture

AlgoSiege bridges real-time frontend execution with dynamic backend analysis using a modern, scalable stack.

### Frontend (The Arena)
* **React.js & Vite:** For a lightning-fast, highly responsive single-page application.
* **Tailwind CSS:** Custom dark-mode, cyberpunk UI styling.
* **Monaco Editor:** Native VS Code integration directly in the browser for an authentic developer experience.

### Backend (The Brains)
* **Python (FastAPI):** High-performance, lightweight server handling rapid code evaluation.
* **Dynamic Evaluation Engine:** Utilizes Python's Abstract Syntax Tree (`ast` module) and AI/LLM APIs to estimate execution complexity on the fly without running infinite loops.
* **Real-Time Data Bridge:** REST APIs (Prototype) scaling to WebSockets for live 1v1 matchmaking and state synchronization.

---

## 🚀 Getting Started

Follow these instructions to run the AlgoSiege prototype locally.

### Prerequisites
* Node.js (v18+)
* Python (3.9+)

### Frontend Setup
```bash
# Clone the repository
git clone [https://github.com/yourusername/AlgoSiege.git](https://github.com/yourusername/AlgoSiege.git)

# Navigate to the frontend directory
cd AlgoSiege/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
Backend Setup
Bash
# Navigate to the backend directory
cd AlgoSiege/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
🗺️ Future Roadmap
Phase 1 (Current): Core UI, Monaco Editor integration, and AST/AI complexity estimation engine.

Phase 2: Full WebSocket integration for live 1v1 matchmaking and dynamic health-bar syncing across clients.

Phase 3: Multi-language execution support (C++, Java, JS) and B2B SaaS pivoting for enterprise tech recruiting.

👨‍💻 Team HustLers
Built by students from Maharaja Agrasen Institute of Technology (MAIT):

Mahir Sharma

Keshavv Goel

Ankur Deb

Pankaj Singh Bisht

"Optimize or Lose."
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 61fb5f5 (Initial frontend prototype)
