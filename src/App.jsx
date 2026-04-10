import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

/* ══════════════════════════════════════════════════════════════════════════════
   ██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗
   ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗
   ██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║
   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║
   ██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝
   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝
   ALGO-SIEGE — Gamified Coding Arena
   Stack: React + Monaco Editor + Python Backend (FastAPI/Flask)
══════════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   🔌  BACKEND CONFIG
   ─────────────────────────────────────────────────────────────────────────────
   When you have your Python server URL, paste it into BACKEND_URL below.
   Example (FastAPI running locally):  "http://localhost:8000"
   Example (deployed):                 "https://your-api.onrender.com"

   Your FastAPI endpoint should look like:
   ┌─────────────────────────────────────────────────────────────┐
   │  @app.post("/evaluate")                                     │
   │  async def evaluate(payload: dict):                         │
   │      code = payload["code"]                                 │
   │      # RUNTIME BENCHMARKING (Execute on scaled inputs)      │
   │      return {                                               │
   │          "damage":       40,          # int  0-100          │
   │          "complexity":   "O(n)",      # str                 │
   │          "execution_ms": 12.5,        # float (NEW)         │
   │          "memory_kb":    450,         # int (NEW)           │
   │          "passed":       True,        # bool                │
   │          "message":      "Optimal!"   # str                 │
   │      }                                                      │
   └─────────────────────────────────────────────────────────────┘
───────────────────────────────────────────────────────────────────────────── */
const BACKEND_URL = ""; // ← PASTE YOUR URL HERE e.g. "http://localhost:8000"
const EVALUATE_ENDPOINT = `${BACKEND_URL}/evaluate`;

/* ─── BOILERPLATE CODE (plain strings — shown inside Monaco as default code) ── */
const p1Boilerplate = `/**
 * ALGO-SIEGE — Player 1 Arena
 * Target: Two Sum — Aim for O(n)
 * Tip: Use a HashMap for one-pass O(n)
 */
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
`;

const p2Boilerplate = `/**
 * ALGO-SIEGE — Player 2 Arena
 * Two Sum — O(n²) Brute Force :(
 * This nested loop checks every pair...
 */
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]
`;

/* ─── GLOBAL STYLES (injected via <style> tag — keeps everything in one file) ─ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020408; font-family: 'Share Tech Mono', monospace; }

  :root {
    --blue:       #00b4ff;
    --blue-glow:  rgba(0,180,255,0.45);
    --red:        #ff2d55;
    --red-glow:   rgba(255,45,85,0.45);
    --gold:       #ffd700;
    --green:      #00ff9d;
    --orange:     #ff9f0a;
    --surface:    rgba(8,14,28,0.97);
    --border:     rgba(255,255,255,0.06);
  }

  .font-orbitron  { font-family: 'Orbitron', monospace; }
  .font-mono      { font-family: 'Share Tech Mono', monospace; }

  /* GRID BACKGROUND */
  .arena-bg {
    background-color: #020408;
    background-image:
      linear-gradient(rgba(0,180,255,0.032) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,255,0.032) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  /* CRT SCANLINES */
  .scanlines::after {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 999;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 3px,
      rgba(0,0,0,0.055) 3px, rgba(0,0,0,0.055) 4px
    );
  }

  /* GLITCH TITLE */
  @keyframes glitch {
    0%,89%,100% { transform:none; clip-path:none; }
    91% { transform:translate(-3px,1px);  clip-path:inset(10% 0 70% 0); }
    93% { transform:translate(3px,-1px);  clip-path:inset(70% 0 5%  0); }
    95% { transform:translate(-2px,2px);  clip-path:inset(40% 0 40% 0); }
    97% { transform:translate(2px,-2px); }
  }
  @keyframes glitch-layer {
    0%,88%,100% { opacity:0; }
    90%,96%     { opacity:1; }
    91% { transform:translate(5px,0);  }
    93% { transform:translate(-5px,0); }
    95% { transform:translate(3px,0);  }
  }
  .glitch-title { position:relative; animation: glitch 7s infinite; }
  .glitch-title::before,
  .glitch-title::after {
    content: attr(data-text); position:absolute; inset:0;
    animation: glitch-layer 7s infinite;
  }
  .glitch-title::before { color:var(--blue); left: 2px; }
  .glitch-title::after  { color:var(--red);  left:-2px; animation-delay:.12s; }

  /* HEALTH BAR */
  .hp-fill { transition: width .65s cubic-bezier(.4,0,.2,1); }
  @keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  .hp-low .hp-fill { animation: hp-pulse .75s infinite; }

  /* PANEL BORDERS */
  .panel-blue {
    border: 1px solid rgba(0,180,255,.18);
    box-shadow: 0 0 40px rgba(0,180,255,.04), inset 0 0 50px rgba(0,180,255,.02);
    transition: border-color .25s, box-shadow .25s;
  }
  .panel-red {
    border: 1px solid rgba(255,45,85,.18);
    box-shadow: 0 0 40px rgba(255,45,85,.04), inset 0 0 50px rgba(255,45,85,.02);
    transition: border-color .25s, box-shadow .25s;
  }
  .panel-red.hit-border {
    border-color: rgba(255,45,85,.75);
    box-shadow: 0 0 60px rgba(255,45,85,.35);
  }

  /* SHAKE ANIMATION (P2 panel on hit) */
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    15%  { transform:translateX(-7px) rotate(-.4deg); }
    30%  { transform:translateX( 7px) rotate( .4deg); }
    50%  { transform:translateX(-4px); }
    70%  { transform:translateX( 4px); }
    85%  { transform:translateX(-2px); }
  }
  .do-shake { animation: shake .48s ease; }

  /* HIT FLASH */
  @keyframes hit-flash {
    0%   { background: rgba(255,45,85,.2); }
    100% { background: transparent; }
  }
  .do-flash { animation: hit-flash .38s ease-out; }

  /* ATTACK BUTTON */
  @keyframes btn-breathe {
    0%,100% { box-shadow: 0 0 14px var(--blue-glow), inset 0 0 12px rgba(0,180,255,.06); }
    50%     { box-shadow: 0 0 28px var(--blue-glow), inset 0 0 22px rgba(0,180,255,.12); }
  }
  .attack-btn {
    background: linear-gradient(135deg,#003a5c,#005f8a,#003a5c);
    border: 1px solid var(--blue); color:#fff; cursor:pointer;
    letter-spacing:.2em; text-transform:uppercase;
    animation: btn-breathe 2.2s infinite; transition: transform .1s;
  }
  .attack-btn:hover  { transform:translateY(-2px); }
  .attack-btn:active { transform:translateY(1px);  }

  /* LOADING SPINNER (used while backend processes) */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width:14px; height:14px; border-radius:50%;
    border: 2px solid rgba(0,180,255,.2);
    border-top-color: var(--blue);
    animation: spin .7s linear infinite; display:inline-block;
  }

  /* PROCESSING DOTS (shown in button while awaiting backend) */
  @keyframes dot-blink {
    0%,20%   { opacity:.2; }
    50%      { opacity:1;  }
    80%,100% { opacity:.2; }
  }
  .dot1 { animation: dot-blink 1.2s infinite .0s; }
  .dot2 { animation: dot-blink 1.2s infinite .2s; }
  .dot3 { animation: dot-blink 1.2s infinite .4s; }

  /* ERROR SHAKE (on fetch error) */
  @keyframes err-shake {
    0%,100%{transform:translateX(0)}
    25%{transform:translateX(-5px)}
    75%{transform:translateX(5px)}
  }
  .err-shake { animation: err-shake .3s ease 2; }

  /* LOG ENTRY */
  @keyframes log-in {
    from { opacity:0; transform:translateY(-5px); }
    to   { opacity:1; transform:none; }
  }
  .log-entry { animation: log-in .28s ease; }

  /* TIMER */
  @keyframes tick { 0%,100%{opacity:1} 50%{opacity:.4} }
  .timer-blink { animation: tick 1s infinite; }

  /* VICTORY */
  @keyframes v-in {
    from { opacity:0; transform:scale(.8); }
    to   { opacity:1; transform:scale(1);  }
  }
  @keyframes v-glow {
    0%,100%{ text-shadow:0 0 20px var(--green),0 0 40px var(--green); }
    50%    { text-shadow:0 0 40px var(--green),0 0 80px var(--green),0 0 120px var(--green); }
  }
  .victory-card { animation: v-in .4s cubic-bezier(.34,1.56,.64,1); }
  .victory-text { animation: v-glow 1.6s infinite; }

  /* CONNECTION STATUS DOT */
  @keyframes conn-pulse {
    0%,100% { opacity:1; box-shadow: 0 0 4px currentColor; }
    50%     { opacity:.5; box-shadow: 0 0 10px currentColor; }
  }
  .conn-dot { animation: conn-pulse 2s infinite; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }
`;

/* ══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════ */

/* Corner bracket decorations on panels */
function Corners({ color }) {
  const c =
    color === "blue"
      ? "var(--blue)"
      : color === "green"
        ? "var(--green)"
        : "var(--red)";
  const corner = (top, right, bottom, left) => ({
    position: "absolute",
    width: "14px",
    height: "14px",
    ...(top != null ? { top: -1 } : { bottom: -1 }),
    ...(left != null ? { left: -1 } : { right: -1 }),
    borderTop: top != null ? `2px solid ${c}` : "none",
    borderBottom: bottom != null ? `2px solid ${c}` : "none",
    borderLeft: left != null ? `2px solid ${c}` : "none",
    borderRight: right != null ? `2px solid ${c}` : "none",
  });
  return (
    <>
      <div style={corner(0, null, null, 0)} />
      <div style={corner(0, 0)} />
      <div style={corner(null, null, 0, 0)} />
      <div style={corner(null, 0, 0)} />
    </>
  );
}

/* Animated health bar */
function HealthBar({ health, color }) {
  const isBlue = color === "blue";
  const isLow = health > 0 && health <= 25;
  const isDead = health <= 0;
  const accent = isBlue ? "var(--blue)" : "var(--red)";
  const glow = isBlue ? "var(--blue-glow)" : "var(--red-glow)";
  const fill = isDead
    ? "#333"
    : isLow
      ? "linear-gradient(90deg,#ff6b35aa,#ff6b35)"
      : `linear-gradient(90deg,${accent}88,${accent})`;

  return (
    <div style={{ width: "100%", marginBottom: "10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: "9px",
            letterSpacing: ".3em",
            color: isDead ? "#555" : accent,
            opacity: 0.75,
          }}
        >
          INTEGRITY
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isLow && (
            <span
              style={{
                fontSize: "9px",
                color: "#ff6b35",
                letterSpacing: ".2em",
                animation: "hp-pulse .8s infinite",
              }}
            >
              ⚠ LOW HP
            </span>
          )}
          <span
            className="font-orbitron"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: isDead ? "#555" : accent,
            }}
          >
            {health}
            <span style={{ fontSize: "9px", opacity: 0.5 }}>%</span>
          </span>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          borderRadius: "2px",
          overflow: "hidden",
          background: "rgba(255,255,255,.04)",
          border: `1px solid ${isBlue ? "rgba(0,180,255,.12)" : "rgba(255,45,85,.12)"}`,
          position: "relative",
        }}
      >
        {[25, 50, 75].map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              left: `${t}%`,
              top: 0,
              bottom: 0,
              width: "1px",
              background: "rgba(0,0,0,.6)",
              zIndex: 2,
            }}
          />
        ))}
        <div
          className={`hp-fill ${isLow ? "hp-low" : ""}`}
          style={{
            width: `${health}%`,
            height: "100%",
            background: fill,
            boxShadow: isDead ? "none" : `0 0 8px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}

/* Complexity chip badges */
function Chip({ label, color }) {
  const c =
    color === "blue"
      ? {
          bg: "rgba(0,180,255,.07)",
          border: "rgba(0,180,255,.25)",
          text: "var(--blue)",
        }
      : {
          bg: "rgba(255,45,85,.07)",
          border: "rgba(255,45,85,.25)",
          text: "var(--red)",
        };
  return (
    <span
      className="font-mono"
      style={{
        fontSize: "9px",
        padding: "2px 8px",
        borderRadius: "2px",
        letterSpacing: ".12em",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

/* Connection status pill (top bar) */
function ConnStatus({ status }) {
  // status: "idle" | "connected" | "error" | "loading"
  const map = {
    idle: {
      color: "rgba(255,255,255,.25)",
      dot: "rgba(255,255,255,.25)",
      label: "NO BACKEND",
    },
    connected: {
      color: "var(--green)",
      dot: "var(--green)",
      label: "CONNECTED",
    },
    error: { color: "var(--red)", dot: "var(--red)", label: "API ERROR" },
    loading: { color: "var(--gold)", dot: "var(--gold)", label: "PROCESSING" },
  };
  const s = map[status] || map.idle;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {status === "loading" ? (
        <span
          className="spinner"
          style={{ width: "8px", height: "8px", borderTopColor: s.dot }}
        />
      ) : (
        <span
          className="conn-dot"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: s.dot,
            display: "inline-block",
            color: s.dot,
          }}
        />
      )}
      <span
        className="font-mono"
        style={{ fontSize: "9px", letterSpacing: ".18em", color: s.color }}
      >
        {s.label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── STATE ───────────────────────────────────────────────────── */
  const [p1Health, setP1Health] = useState(100);
  const [p2Health, setP2Health] = useState(100);
  const [attackLog, setAttackLog] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [timer, setTimer] = useState(99);

  // ── Backend states ──
  // editorValue: live content of Player 1's Monaco editor (updated on every keystroke)
  const [editorValue, setEditorValue] = useState(p1Boilerplate);
  // isLoading: true while waiting for backend response (disables button, shows spinner)
  const [isLoading, setIsLoading] = useState(false);
  // apiError: stores last error message from backend (shown in log + button shake)
  const [apiError, setApiError] = useState(null);
  // connStatus: drives the connection pill in the header
  const [connStatus, setConnStatus] = useState(BACKEND_URL ? "idle" : "idle");
  // btnError: triggers the error shake animation on the attack button
  const [btnError, setBtnError] = useState(false);
  // lastResult: last successful API response — shown in log
  const [lastResult, setLastResult] = useState(null);

  const timerRef = useRef(null);
  const isP2Dead = p2Health <= 0;

  /* ── COUNTDOWN TIMER ─────────────────────────────────────────── */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  /* ── TIMESTAMP HELPER ────────────────────────────────────────── */
  const getTimestamp = () => {
    const n = new Date();
    return [n.getHours(), n.getMinutes(), n.getSeconds()]
      .map((x) => String(x).padStart(2, "0"))
      .join(":");
  };

  /* ── LOG HELPER ──────────────────────────────────────────────── */
  const pushLog = useCallback((msg, type = "info") => {
    setAttackLog((prev) => [
      { time: getTimestamp(), msg, type },
      ...prev.slice(0, 6),
    ]);
  }, []);

  /* ════════════════════════════════════════════════════════════════
     🔌  handleAttack — BACKEND CONNECTED VERSION
     ────────────────────────────────────────────────────────────────
     Flow:
       1. Set isLoading = true  → button shows spinner + "BENCHMARKING..."
       2. POST { code, target } to EVALUATE_ENDPOINT
       3. Backend responds with { damage, complexity, execution_ms, memory_kb, passed, message }
       4a. On success → apply damage, push log, trigger shake/flash
       4b. On error   → show error in log, shake button red
       5. Set isLoading = false  → button returns to normal
     ═══════════════════════════════════════════════════════════════ */
  const handleAttack = async () => {
    if (isP2Dead || isLoading) return;

    /* ── No backend URL set: run in demo mode ── */
    if (!BACKEND_URL) {
      const dmg = 25;
      const actual = Math.min(dmg, p2Health);
      setP2Health((h) => Math.max(0, h - dmg));
      triggerHitFX();
      pushLog(
        `[DEMO] P1 struck for -${actual} HP (Execution: 14ms | Mem: 3.2MB)`,
        "hit",
      );
      return;
    }

    /* ── Real backend call ── */
    setIsLoading(true);
    setApiError(null);
    setConnStatus("loading");
    pushLog("⏳ Sending code to backend for analysis...", "info");

    try {
      const response = await fetch(EVALUATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your backend needs CORS or auth headers, add them here:
          // "Authorization": "Bearer YOUR_TOKEN",
        },
        body: JSON.stringify({
          code: editorValue, // the full code string from Monaco
          target: "twoSum", // which problem is being evaluated
          nums: [2, 7, 11, 15], // test input (optional — your backend decides)
          target_sum: 9, // test input (optional)
        }),
      });

      /* ── Non-2xx HTTP response ── */
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText}`);
      }

      /* ── Parse JSON from Python backend ── */
      const data = await response.json();
      /*
        Expected shape from your Python backend:
        {
          "damage":       40,          // how much HP to deduct from P2
          "complexity":   "O(n)",      // detected complexity string
          "execution_ms": 12.5,        // benchmarked execution time
          "memory_kb":    450,         // benchmarked memory usage
          "passed":       true,        // did the code pass the test cases?
          "message":      "Optimal!"   // optional feedback shown in log
        }
      */

      const damage = data.damage ?? 25;
      const complexity = data.complexity ?? "?";
      const passed = data.passed ?? true;
      const message = data.message ?? "";

      setLastResult(data);
      setConnStatus("connected");

      if (passed) {
        const actual = Math.min(damage, p2Health);
        const execTime = data.execution_ms ? `${data.execution_ms}ms` : "N/A";
        const memUse = data.memory_kb ? `${data.memory_kb}KB` : "N/A";

        setP2Health((h) => Math.max(0, h - damage));
        triggerHitFX();
        pushLog(
          `⚡ ${complexity} verified — Time: ${execTime} | Mem: ${memUse} — -${actual} HP dealt`,
          "hit",
        );
      } else {
        /* Solution didn't pass tests — no damage, show warning */
        pushLog(
          `❌ Code failed tests (${complexity}) · ${message || "Fix your solution"}`,
          "error",
        );
        triggerErrorFX();
      }
    } catch (err) {
      /* ── Network error / backend offline ── */
      const msg = err.message || "Could not reach backend";
      setApiError(msg);
      setConnStatus("error");
      pushLog(`🔴 Backend error: ${msg}`, "error");
      triggerErrorFX();
      console.error("[ALGO-SIEGE] Backend error:", err);
    } finally {
      /* Always runs — re-enable button whether success or fail */
      setIsLoading(false);
    }
  };

  /* ── HIT ANIMATION ───────────────────────────────────────────── */
  const triggerHitFX = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 380);
  };

  /* ── ERROR ANIMATION (button shakes red) ─────────────────────── */
  const triggerErrorFX = () => {
    setBtnError(true);
    setTimeout(() => setBtnError(false), 700);
  };

  /* ── DERIVE BUTTON STATE ─────────────────────────────────────── */
  const btnContent = () => {
    if (isP2Dead)
      return { label: "⚡ ENEMY DEFEATED", disabled: true, style: "dead" };
    if (isLoading) return { label: null, disabled: true, style: "loading" };
    if (btnError)
      return { label: "✗ CHECK YOUR CODE", disabled: false, style: "error" };
    return { label: "⚡ EXECUTE ATTACK", disabled: false, style: "normal" };
  };
  const btn = btnContent();

  const timerCol =
    timer <= 10 ? "var(--red)" : timer <= 30 ? "var(--orange)" : "var(--gold)";

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{STYLES}</style>

      <div
        className="arena-bg scanlines"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* ════════════ HEADER ════════════ */}
        <header
          style={{ padding: "14px 20px 0", position: "relative", zIndex: 10 }}
        >
          {/* Status bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 12px",
              marginBottom: "11px",
              background: "rgba(255,255,255,.02)",
              border: "1px solid var(--border)",
              borderRadius: "3px",
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: "10px",
                color: "var(--blue)",
                letterSpacing: ".2em",
              }}
            >
              ◈ ALGO-SIEGE v2.5
            </span>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <ConnStatus status={connStatus} />
              {[
                ["ROUND", "01 / 03"],
                ["MODE", "RANKED"],
              ].map(([k, v]) => (
                <span
                  key={k}
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,.22)",
                    letterSpacing: ".15em",
                  }}
                >
                  {k}:&nbsp;<strong style={{ color: "#fff" }}>{v}</strong>
                </span>
              ))}
              <div
                className="timer-blink"
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: timerCol,
                    boxShadow: `0 0 6px ${timerCol}`,
                    display: "inline-block",
                  }}
                />
                <span
                  className="font-orbitron"
                  style={{
                    fontSize: "12px",
                    color: timerCol,
                    letterSpacing: ".1em",
                  }}
                >
                  {String(timer).padStart(2, "0")}s
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "11px" }}>
            <h1
              className="glitch-title font-orbitron"
              data-text="ALGO-SIEGE"
              style={{
                fontSize: "clamp(34px,5.5vw,58px)",
                fontWeight: 900,
                letterSpacing: ".3em",
                lineHeight: 1,
                background:
                  "linear-gradient(180deg,#fff 0%,rgba(255,255,255,.6) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            <div
              style={{
                marginTop: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  height: "1px",
                  width: "48px",
                  background: "linear-gradient(90deg,transparent,var(--blue))",
                }}
              />
              <span
                className="font-mono"
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,.33)",
                  letterSpacing: ".18em",
                }}
              >
                TARGET:&nbsp;
                <span style={{ color: "var(--gold)" }}>TWO SUM</span>
                &nbsp;·&nbsp;OPTIMIZE FOR&nbsp;
                <span style={{ color: "var(--green)" }}>O(n)</span>
              </span>
              <div
                style={{
                  height: "1px",
                  width: "48px",
                  background: "linear-gradient(90deg,var(--red),transparent)",
                }}
              />
            </div>
          </div>

          {/* VS bar */}
          <div
            style={{
              display: "flex",
              height: "30px",
              borderRadius: "3px",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(0,180,255,.07)",
                display: "flex",
                alignItems: "center",
                paddingLeft: "12px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  color: "var(--blue)",
                  letterSpacing: ".2em",
                }}
              >
                🧑‍💻 PLAYER_ONE — HASHMAP HUNTER
              </span>
            </div>
            <div
              style={{
                padding: "0 14px",
                background: "rgba(255,255,255,.03)",
                display: "flex",
                alignItems: "center",
                borderLeft: "1px solid var(--border)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <span
                className="font-orbitron"
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  color: "rgba(255,255,255,.28)",
                  letterSpacing: ".2em",
                }}
              >
                VS
              </span>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,45,85,.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: "12px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  color: "var(--red)",
                  letterSpacing: ".2em",
                }}
              >
                BRUTE_FORCE BOT 🤖
              </span>
            </div>
          </div>
        </header>

        {/* ════════════ ARENA ════════════ */}
        <main
          style={{
            display: "flex",
            flex: 1,
            gap: "10px",
            padding: "10px 20px",
          }}
        >
          {/* ── PLAYER 1 ── */}
          <div
            className="panel-blue"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "var(--surface)",
              borderRadius: "6px",
              padding: "14px",
              position: "relative",
            }}
          >
            <Corners color="blue" />

            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "9px",
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    color: "var(--blue)",
                    letterSpacing: ".3em",
                    opacity: 0.65,
                    marginBottom: "2px",
                  }}
                >
                  ◈ PLAYER 1
                </div>
                <div
                  className="font-orbitron"
                  style={{
                    fontSize: "15px",
                    color: "#fff",
                    letterSpacing: ".05em",
                  }}
                >
                  YOU
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    padding: "3px 9px",
                    borderRadius: "2px",
                    letterSpacing: ".12em",
                    display: "inline-block",
                    marginBottom: "3px",
                    background: "rgba(0,180,255,.08)",
                    border: "1px solid rgba(0,180,255,.3)",
                    color: "var(--blue)",
                  }}
                >
                  {lastResult?.complexity ? lastResult.complexity : "O(n) ✓"}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,.2)",
                    letterSpacing: ".15em",
                  }}
                >
                  RANK #1204
                </div>
              </div>
            </div>

            <HealthBar health={p1Health} color="blue" />

            {/* Complexity chips */}
            <div
              style={{
                display: "flex",
                gap: "5px",
                marginBottom: "9px",
                flexWrap: "wrap",
              }}
            >
              {["TIME: O(n)", "SPACE: O(n)", "HASHMAP ✓"].map((t) => (
                <Chip key={t} label={t} color="blue" />
              ))}
            </div>

            {/* ── MONACO EDITOR ──
                onChange fires on every keystroke, updating editorValue state.
                editorValue is then sent to the backend when attack is triggered. */}
            <div
              style={{
                flex: 1,
                minHeight: "320px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(0,180,255,.1)",
              }}
            >
              <Editor
                height="320px"
                language="javascript"
                theme="vs-dark"
                defaultValue={p1Boilerplate}
                onChange={(val) => setEditorValue(val ?? "")}
                /*
                  ↑ onChange is called by Monaco every time the user types.
                  val is a string containing the full editor content.
                  We store it in editorValue so handleAttack can send it to the backend.
                  The ?? "" guard ensures we never store undefined.
                */
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Share Tech Mono','Courier New',monospace",
                  lineHeight: 21,
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "gutter",
                  cursorBlinking: "phase",
                  // Disable suggestions to keep focus on the battle
                  quickSuggestions: {
                    other: false,
                    comments: false,
                    strings: false,
                  },
                }}
              />
            </div>

            {/* ── ATTACK BUTTON ── */}
            <button
              onClick={handleAttack}
              disabled={btn.disabled}
              className={[
                "font-orbitron",
                btn.style === "normal" ? "attack-btn" : "",
                btn.style === "error" ? "err-shake" : "",
              ].join(" ")}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
                marginTop: "9px",
                ...(btn.style === "dead" || btn.style === "loading"
                  ? {
                      background: "rgba(255,255,255,.02)",
                      border: "1px solid rgba(255,255,255,.07)",
                      color: "rgba(255,255,255,.22)",
                      cursor: btn.style === "loading" ? "wait" : "not-allowed",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                    }
                  : {}),
                ...(btn.style === "error"
                  ? {
                      background: "rgba(255,45,85,.1)",
                      border: "1px solid rgba(255,45,85,.5)",
                      color: "var(--red)",
                      cursor: "pointer",
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                    }
                  : {}),
              }}
            >
              {btn.style === "loading" ? (
                /* Spinner + animated dots while backend is processing */
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span className="spinner" />
                  <span style={{ letterSpacing: ".15em" }}>
                    BENCHMARKING<span className="dot1">.</span>
                    <span className="dot2">.</span>
                    <span className="dot3">.</span>
                  </span>
                </span>
              ) : (
                btn.label
              )}
            </button>

            {/* ── API Error banner (appears below button if backend fails) ── */}
            {apiError && (
              <div
                className="font-mono"
                style={{
                  marginTop: "6px",
                  padding: "6px 10px",
                  borderRadius: "3px",
                  fontSize: "9px",
                  letterSpacing: ".1em",
                  lineHeight: "1.5",
                  background: "rgba(255,45,85,.07)",
                  border: "1px solid rgba(255,45,85,.25)",
                  color: "var(--red)",
                }}
              >
                🔴 {apiError}
              </div>
            )}
          </div>

          {/* ── DIVIDER ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "20px 0",
            }}
          >
            <div
              style={{
                width: "1px",
                flex: 1,
                background:
                  "linear-gradient(to bottom,transparent,rgba(255,255,255,.08),rgba(255,255,255,.12),rgba(255,255,255,.08),transparent)",
              }}
            />
            <span
              className="font-orbitron"
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "rgba(255,255,255,.1)",
                letterSpacing: ".15em",
              }}
            >
              ✕
            </span>
            <div
              style={{
                width: "1px",
                flex: 1,
                background:
                  "linear-gradient(to bottom,transparent,rgba(255,255,255,.08),rgba(255,255,255,.12),rgba(255,255,255,.08),transparent)",
              }}
            />
          </div>

          {/* ── PLAYER 2 ── */}
          <div
            className={[
              "panel-red",
              shaking ? "do-shake" : "",
              flashing ? "do-flash" : "",
              flashing ? "hit-border" : "",
            ].join(" ")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "var(--surface)",
              borderRadius: "6px",
              padding: "14px",
              position: "relative",
              opacity: isP2Dead ? 0.42 : 1,
              transition: "opacity .5s",
            }}
          >
            <Corners color="red" />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "9px",
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    color: "var(--red)",
                    letterSpacing: ".3em",
                    opacity: 0.65,
                    marginBottom: "2px",
                  }}
                >
                  ◈ PLAYER 2
                </div>
                <div
                  className="font-orbitron"
                  style={{
                    fontSize: "15px",
                    color: "#fff",
                    letterSpacing: ".05em",
                  }}
                >
                  OPPONENT
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    padding: "3px 9px",
                    borderRadius: "2px",
                    letterSpacing: ".12em",
                    display: "inline-block",
                    marginBottom: "3px",
                    background: "rgba(255,45,85,.08)",
                    border: "1px solid rgba(255,45,85,.3)",
                    color: "var(--red)",
                  }}
                >
                  O(n²) ✗
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,.2)",
                    letterSpacing: ".15em",
                  }}
                >
                  RANK #4891
                </div>
              </div>
            </div>

            <HealthBar health={p2Health} color="red" />

            <div
              style={{
                display: "flex",
                gap: "5px",
                marginBottom: "9px",
                flexWrap: "wrap",
              }}
            >
              {["TIME: O(n²)", "SPACE: O(1)", "NESTED LOOP ✗"].map((t) => (
                <Chip key={t} label={t} color="red" />
              ))}
            </div>

            <div
              style={{
                flex: 1,
                minHeight: "320px",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(255,45,85,.1)",
              }}
            >
              <Editor
                height="320px"
                language="javascript"
                theme="vs-dark"
                defaultValue={p2Boilerplate}
                options={{
                  minimap: { enabled: false },
                  readOnly: true, // ← P2's editor is read-only (it's the opponent's code)
                  fontSize: 13,
                  fontFamily: "'Share Tech Mono','Courier New',monospace",
                  lineHeight: 21,
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "none",
                  cursorStyle: "underline",
                }}
              />
            </div>

            <button
              disabled
              className="font-orbitron"
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 700,
                marginTop: "9px",
                letterSpacing: ".15em",
                textTransform: "uppercase",
                background: "rgba(255,255,255,.02)",
                border: "1px solid rgba(255,255,255,.05)",
                color: "rgba(255,255,255,.14)",
                cursor: "not-allowed",
              }}
            >
              ⏳ WAITING FOR OPPONENT...
            </button>
          </div>
        </main>

        {/* ════════════ BATTLE LOG ════════════ */}
        <footer style={{ padding: "0 20px 14px" }}>
          <div
            style={{
              background: "rgba(0,0,0,.55)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "9px 13px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: ".3em",
                  color: "rgba(255,255,255,.18)",
                }}
              >
                ◈ BATTLE LOG
              </span>
              <span
                className="font-mono"
                style={{ fontSize: "9px", color: "rgba(255,255,255,.12)" }}
              >
                {attackLog.length} EVENTS
              </span>
            </div>
            {attackLog.length === 0 ? (
              <span
                className="font-mono"
                style={{ fontSize: "11px", color: "rgba(255,255,255,.13)" }}
              >
                {BACKEND_URL
                  ? "_ backend ready — awaiting first strike..."
                  : "_ running in demo mode (no backend URL set)..."}
              </span>
            ) : (
              attackLog.map((e, i) => {
                const col =
                  e.type === "hit"
                    ? "var(--green)"
                    : e.type === "error"
                      ? "var(--red)"
                      : "rgba(255,255,255,.35)";
                return (
                  <div
                    key={i}
                    className={`font-mono ${i === 0 ? "log-entry" : ""}`}
                    style={{
                      fontSize: "11px",
                      color: i === 0 ? col : "rgba(255,255,255,.2)",
                      display: "flex",
                      gap: "12px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{ color: "rgba(255,255,255,.14)", flexShrink: 0 }}
                    >
                      [{e.time}]
                    </span>
                    <span>{e.msg}</span>
                  </div>
                );
              })
            )}
          </div>
        </footer>

        {/* ════════════ VICTORY OVERLAY ════════════ */}
        {isP2Dead && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,.8)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="victory-card"
              style={{
                textAlign: "center",
                padding: "44px 56px",
                background: "rgba(3,10,18,.98)",
                border: "1px solid rgba(0,255,157,.3)",
                boxShadow: "0 0 80px rgba(0,255,157,.15)",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <Corners color="green" />
              <div
                className="font-mono"
                style={{
                  fontSize: "9px",
                  letterSpacing: ".4em",
                  color: "rgba(0,255,157,.45)",
                  marginBottom: "10px",
                }}
              >
                ◈ ROUND COMPLETE ◈
              </div>
              <div
                className="victory-text font-orbitron"
                style={{
                  fontSize: "clamp(38px,6vw,54px)",
                  fontWeight: 900,
                  letterSpacing: ".25em",
                  color: "var(--green)",
                  lineHeight: 1,
                }}
              >
                VICTORY
              </div>
              <div
                className="font-mono"
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  letterSpacing: ".18em",
                  color: "rgba(255,255,255,.28)",
                }}
              >
                O(n) HASHMAP DOMINATES O(n²) BRUTE FORCE
              </div>
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {["+250 XP", "+1 WIN", "EFFICIENCY BADGE"].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono"
                    style={{
                      fontSize: "9px",
                      padding: "4px 10px",
                      borderRadius: "2px",
                      letterSpacing: ".15em",
                      background: "rgba(0,255,157,.07)",
                      border: "1px solid rgba(0,255,157,.2)",
                      color: "var(--green)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
