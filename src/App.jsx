import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const BACKEND_URL = "https://shine-gluten-reconvene.ngrok-free.dev";
const EVALUATE_ENDPOINT = `${BACKEND_URL}/analyze`;

const p1Boilerplate = `"""
ALGO-SIEGE - Player 1
Two Sum target: O(n)
"""

def two_sum(nums, target):
    seen = {}
    answer = []

    for i, num in enumerate(nums):
        need = target - num

        if need in seen:
            answer = [seen[need], i]
            break

        seen[num] = i

    return answer

print(two_sum([2, 7, 11, 15], 9))
`;

const p2Boilerplate = `"""
ALGO-SIEGE - Opponent
Two Sum brute force: O(n^2)
"""

def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if i != j and nums[i] + nums[j] == target:
                return [i, j]

    return []

print(two_sum([2, 7, 11, 15], 9))
`;

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; background: #020408; font-family: 'Share Tech Mono', monospace; }

  :root {
    --blue: #00b4ff;
    --red: #ff2d55;
    --green: #00ff9d;
    --gold: #ffd700;
    --orange: #ff9f0a;
    --panel: rgba(8,14,28,0.97);
    --border: rgba(255,255,255,0.08);
  }

  .arena {
    min-height: 100vh;
    color: white;
    background-color: #020408;
    background-image:
      linear-gradient(rgba(0,180,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,255,0.035) 1px, transparent 1px);
    background-size: 44px 44px;
    padding: 18px 20px;
  }

  .topbar, .log {
    border: 1px solid var(--border);
    background: rgba(0,0,0,0.48);
    border-radius: 6px;
    padding: 10px 14px;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .title {
    font-family: 'Orbitron', monospace;
    font-size: clamp(34px, 6vw, 62px);
    letter-spacing: 0.25em;
    text-align: center;
    margin: 12px 0 8px;
  }

  .subtitle {
    color: rgba(255,255,255,0.55);
    text-align: center;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
    gap: 12px;
  }

  .panel {
    position: relative;
    background: var(--panel);
    border-radius: 6px;
    padding: 14px;
    min-width: 0;
  }

  .blue { border: 1px solid rgba(0,180,255,0.28); }
  .red { border: 1px solid rgba(255,45,85,0.28); }

  .panel.hit {
    animation: shake 0.45s ease;
    box-shadow: 0 0 50px rgba(255,45,85,0.35);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-7px); }
    40% { transform: translateX(7px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .label {
    font-size: 10px;
    letter-spacing: 0.22em;
    opacity: 0.65;
  }

  .name {
    font-family: 'Orbitron', monospace;
    font-size: 16px;
    margin-top: 4px;
  }

  .chip {
    display: inline-block;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.8);
  }

  .hp-label {
    display: flex;
    justify-content: space-between;
    margin: 12px 0 5px;
    font-size: 11px;
    letter-spacing: 0.12em;
  }

  .hp-track {
    height: 10px;
    border-radius: 4px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 10px;
  }

  .hp-fill {
    height: 100%;
    transition: width 0.55s ease;
  }

  .editor-shell {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .attack {
    width: 100%;
    margin-top: 10px;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--blue);
    background: linear-gradient(135deg, #003a5c, #005f8a, #003a5c);
    color: white;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  .attack:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .attack.error {
    border-color: var(--red);
    background: rgba(255,45,85,0.15);
    color: var(--red);
    animation: err-shake 0.3s ease 2;
  }

  @keyframes err-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .middle {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.18);
    font-family: 'Orbitron', monospace;
    font-weight: 900;
  }

  .log {
    margin-top: 14px;
    min-height: 92px;
  }

  .log-row {
    display: flex;
    gap: 12px;
    font-size: 12px;
    margin-top: 5px;
  }

  .error-banner {
    margin-top: 8px;
    padding: 8px 10px;
    border: 1px solid rgba(255,45,85,0.32);
    border-radius: 6px;
    color: var(--red);
    background: rgba(255,45,85,0.08);
    font-size: 12px;
  }

  .victory {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.82);
    display: grid;
    place-items: center;
    z-index: 10;
  }

  .victory-card {
    border: 1px solid rgba(0,255,157,0.35);
    border-radius: 8px;
    padding: 42px 54px;
    background: rgba(3,10,18,0.98);
    text-align: center;
    box-shadow: 0 0 80px rgba(0,255,157,0.15);
  }

  .victory-text {
    color: var(--green);
    font-family: 'Orbitron', monospace;
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 0.2em;
  }
`;

function HealthBar({ health, color }) {
  return (
    <>
      <div className="hp-label">
        <span>INTEGRITY</span>
        <span style={{ color }}>{health}%</span>
      </div>
      <div className="hp-track">
        <div
          className="hp-fill"
          style={{
            width: `${health}%`,
            background: health <= 25 ? "var(--orange)" : color,
          }}
        />
      </div>
    </>
  );
}

function ConnStatus({ status }) {
  const config = {
    idle: ["NO BACKEND", "rgba(255,255,255,0.35)"],
    loading: ["PROCESSING", "var(--gold)"],
    connected: ["CONNECTED", "var(--green)"],
    error: ["API ERROR", "var(--red)"],
  };
  const [label, color] = config[status] ?? config.idle;

  return (
    <span style={{ color, fontSize: 11, letterSpacing: "0.15em" }}>
      {label}
    </span>
  );
}

function getTime() {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function App() {
  const [p1Health] = useState(100);
  const [p2Health, setP2Health] = useState(100);
  const [timer, setTimer] = useState(99);
  const [editorValue, setEditorValue] = useState(p1Boilerplate);
  const [attackLog, setAttackLog] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [connStatus, setConnStatus] = useState(BACKEND_URL ? "idle" : "idle");
  const [buttonError, setButtonError] = useState(false);
  const [hitFx, setHitFx] = useState(false);

  const timerRef = useRef(null);
  const isP2Dead = p2Health <= 0;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((value) => {
        if (value <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const pushLog = useCallback((message, type = "info") => {
    setAttackLog((previous) => [
      { time: getTime(), message, type },
      ...previous.slice(0, 6),
    ]);
  }, []);

  const triggerHit = () => {
    setHitFx(true);
    setTimeout(() => setHitFx(false), 500);
  };

  const triggerError = () => {
    setButtonError(true);
    setTimeout(() => setButtonError(false), 700);
  };

  const handleAttack = async () => {
    if (isLoading || isP2Dead) return;

    if (!BACKEND_URL) {
      const damage = 10;
      const actual = Math.min(damage, p2Health);
      setP2Health((health) => Math.max(0, health - damage));
      triggerHit();
      pushLog(`[DEMO] ${actual} HP dealt`, "hit");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setConnStatus("loading");
    pushLog("Sending Python code to backend...", "info");

    try {
      const response = await fetch(EVALUATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          code: editorValue,
          problem_type: "sum",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const damage = typeof data.damage === "number" ? data.damage : 10;
      const complexity = data.complexity ?? "?";
      const verdict = data.verdict ?? "Unknown";
      const reason = data.reason ?? "";
      const actual = Math.min(damage, p2Health);

      setLastResult(data);
      setConnStatus("connected");
      setP2Health((health) => Math.max(0, health - damage));
      triggerHit();

      pushLog(
        `${complexity} | ${verdict}${reason ? ` - ${reason}` : ""} | -${actual} HP`,
        verdict === "Suspicious" ? "error" : "hit",
      );
    } catch (error) {
      const message = error.message || "Could not reach backend";
      setApiError(message);
      setConnStatus("error");
      pushLog(`Backend error: ${message}`, "error");
      triggerError();
      console.error("[ALGO-SIEGE] Backend error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = isP2Dead
    ? "ENEMY DEFEATED"
    : isLoading
      ? "ANALYZING..."
      : buttonError
        ? "CHECK YOUR CODE"
        : "EXECUTE ATTACK";

  const timerColor =
    timer <= 10 ? "var(--red)" : timer <= 30 ? "var(--orange)" : "var(--gold)";

  return (
    <>
      <style>{STYLES}</style>

      <div className="arena">
        <div className="topbar">
          <span style={{ color: "var(--blue)", letterSpacing: "0.18em" }}>
            ALGO-SIEGE v2.5
          </span>
          <span style={{ color: timerColor }}>
            {String(timer).padStart(2, "0")}s
          </span>
          <ConnStatus status={connStatus} />
        </div>

        <h1 className="title">ALGO-SIEGE</h1>
        <div className="subtitle">
          TARGET: TWO SUM Problem  | GOAL: O(n)
        </div>

        <main className="grid">
          <section className="panel blue">
            <div className="row">
              <div>
                <div className="label" style={{ color: "var(--blue)" }}>
                  PLAYER 1
                </div>
                <div className="name">YOU</div>
              </div>
              <div className="chip">
                {lastResult?.complexity ?? "O(n)"}{" "}
                {lastResult?.verdict ?? "READY"}
              </div>
            </div>

            <HealthBar health={p1Health} color="var(--blue)" />

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <span className="chip">PYTHON</span>
              <span className="chip">PROBLEM: SUM</span>
              <span className="chip">EXPECTED: O(n)</span>
            </div>

            <div className="editor-shell">
              <Editor
                height="340px"
                language="python"
                theme="vs-dark"
                defaultValue={p1Boilerplate}
                onChange={(value) => setEditorValue(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 21,
                  scrollBeyondLastLine: false,
                  fontFamily: "'Share Tech Mono','Courier New',monospace",
                }}
              />
            </div>

            <button
              className={`attack ${buttonError ? "error" : ""}`}
              disabled={isLoading || isP2Dead}
              onClick={handleAttack}
            >
              {buttonLabel}
            </button>

            {apiError && <div className="error-banner">{apiError}</div>}
          </section>

          <div className="middle">VS</div>

          <section className={`panel red ${hitFx ? "hit" : ""}`}>
            <div className="row">
              <div>
                <div className="label" style={{ color: "var(--red)" }}>
                  PLAYER 2
                </div>
                <div className="name">OPPONENT</div>
              </div>
              <div className="chip">O(n^2)</div>
            </div>

            <HealthBar health={p2Health} color="var(--red)" />

            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <span className="chip">PYTHON</span>
              <span className="chip">BRUTE FORCE</span>
              <span className="chip">NESTED LOOP</span>
            </div>

            <div className="editor-shell">
              <Editor
                height="340px"
                language="python"
                theme="vs-dark"
                defaultValue={p2Boilerplate}
                options={{
                  minimap: { enabled: false },
                  readOnly: true,
                  fontSize: 13,
                  lineHeight: 21,
                  scrollBeyondLastLine: false,
                  fontFamily: "'Share Tech Mono','Courier New',monospace",
                }}
              />
            </div>

            <button className="attack" disabled>
              WAITING FOR OPPONENT...
            </button>
          </section>
        </main>

        <footer className="log">
          <div className="row">
            <span className="label">BATTLE LOG</span>
            <span className="label">{attackLog.length} EVENTS</span>
          </div>

          {attackLog.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
              _ backend ready - awaiting first strike...
            </div>
          ) : (
            attackLog.map((entry, index) => (
              <div
                className="log-row"
                key={`${entry.time}-${index}`}
                style={{
                  color:
                    entry.type === "hit"
                      ? "var(--green)"
                      : entry.type === "error"
                        ? "var(--red)"
                        : "rgba(255,255,255,0.55)",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.25)" }}>
                  [{entry.time}]
                </span>
                <span>{entry.message}</span>
              </div>
            ))
          )}
        </footer>

        {isP2Dead && (
          <div className="victory">
            <div className="victory-card">
              <div className="victory-text">VICTORY</div>
              <div style={{ marginTop: 10, color: "rgba(255,255,255,0.5)" }}>
                O(n) strategy defeats brute force
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
