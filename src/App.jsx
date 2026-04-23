import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";

// ─────────────────────────────────────────────
// RESIDUE — A Design Probe for Transit Isolation
// v2: Isolation Compass, Body Map, Residue Notes
// ─────────────────────────────────────────────

const METRO_LINES = [
  { name: "Blue Line", color: "#4A7BF7", stops: ["Dwarka Sec 21", "Janakpuri W", "Rajouri Garden", "Karol Bagh", "Rajiv Chowk", "Mandi House", "Yamuna Bank", "Noida City Centre"] },
  { name: "Yellow Line", color: "#D4A843", stops: ["Samaypur Badli", "Vishwavidyalaya", "Kashmere Gate", "Chandni Chowk", "Rajiv Chowk", "Central Secretariat", "AIIMS", "Qutab Minar", "HUDA City Centre"] },
  { name: "Red Line", color: "#C45C4A", stops: ["Rithala", "Netaji Subhash Pl", "Inderlok", "Tis Hazari", "Kashmere Gate", "Shastri Park", "Dilshad Garden", "Shaheed Sthal"] },
  { name: "Violet Line", color: "#8B6FC0", stops: ["Kashmere Gate", "Lal Quila", "Jama Masjid", "ITO", "Mandi House", "Central Secretariat", "Saket", "Badarpur Border"] },
];

const COMPASS_LABELS = {
  "crowded-unseen": "Suffocating",
  "crowded-seen": "Swallowed",
  "empty-unseen": "Erased",
  "empty-seen": "Drifting",
  "center": "Hollow",
};

function getCompassSignal(x, y) {
  const dx = Math.abs(x - 0.5);
  const dy = Math.abs(y - 0.5);
  if (dx < 0.15 && dy < 0.15) return "Hollow";
  const xSide = x < 0.5 ? "crowded" : "empty";
  const ySide = y < 0.5 ? "seen" : "unseen";
  if (dx > 0.35 && dy > 0.35) {
    const map = { "crowded-unseen":"Suffocating", "crowded-seen":"Crushed", "empty-unseen":"Erased", "empty-seen":"Dissolving" };
    return map[`${xSide}-${ySide}`] || "Hollow";
  }
  if (dx > 0.35) return x < 0.5 ? "Compressed" : "Void";
  if (dy > 0.35) return y < 0.5 ? "Exposed" : "Invisible";
  const map = { "crowded-unseen":"Suffocating", "crowded-seen":"Swallowed", "empty-unseen":"Erased", "empty-seen":"Drifting" };
  return map[`${xSide}-${ySide}`] || "Numb";
}

const BODY_ZONES = [
  { id:"head", label:"Head", cx:100, cy:30, rx:22, ry:26 },
  { id:"throat", label:"Throat", cx:100, cy:68, rx:12, ry:10 },
  { id:"chest", label:"Chest", cx:100, cy:110, rx:35, ry:30 },
  { id:"stomach", label:"Stomach", cx:100, cy:160, rx:30, ry:22 },
  { id:"hands_l", label:"Left hand", cx:38, cy:195, rx:14, ry:18 },
  { id:"hands_r", label:"Right hand", cx:162, cy:195, rx:14, ry:18 },
  { id:"legs", label:"Legs", cx:100, cy:270, rx:32, ry:60 },
];

const PROMPTS = [
  "What were you looking at when it hit?",
  "If this feeling had a sound, what would it be?",
  "Who didn't see you?",
  "What did your hands want to do?",
  "What were you pretending to look at?",
  "How long did it last?",
  "What was the last thing you noticed?",
  "Did anyone almost see you?",
  "Where were you trying to go?",
  "What did the air feel like?",
];

const GHOST_SEEDS = [
  { id:1, station:"Rajiv Chowk", signal:"Suffocating", time:"43m", line:"Yellow Line", compass:{x:0.15,y:0.8}, body:["chest","throat"] },
  { id:2, station:"Kashmere Gate", signal:"Invisible", time:"2h", line:"Red Line", compass:{x:0.7,y:0.85}, body:["head"] },
  { id:3, station:"Mandi House", signal:"Drifting", time:"5h", line:"Violet Line", compass:{x:0.75,y:0.3}, body:["hands_l"] },
  { id:4, station:"Rajiv Chowk", signal:"Hollow", time:"31m", line:"Blue Line", compass:{x:0.5,y:0.5}, body:["stomach","chest"] },
  { id:5, station:"Central Secretariat", signal:"Erased", time:"8h", line:"Yellow Line", compass:{x:0.85,y:0.9}, body:["head","chest"] },
  { id:6, station:"Karol Bagh", signal:"Void", time:"12h", line:"Blue Line", compass:{x:0.9,y:0.5}, body:["stomach"] },
  { id:7, station:"Chandni Chowk", signal:"Swallowed", time:"3h", line:"Yellow Line", compass:{x:0.2,y:0.25}, body:["chest","throat"] },
  { id:8, station:"AIIMS", signal:"Dissolving", time:"1h", line:"Yellow Line", compass:{x:0.8,y:0.3}, body:["hands_r","legs"] },
  { id:9, station:"Rajouri Garden", signal:"Invisible", time:"6h", line:"Blue Line", compass:{x:0.65,y:0.88}, body:["head"] },
  { id:10, station:"ITO", signal:"Suffocating", time:"4h", line:"Violet Line", compass:{x:0.1,y:0.75}, body:["chest","stomach","throat"] },
];

const P = {
  void: "#080808",
  deep: "#0D0D0C",
  surface: "#131210",
  surfaceRaised: "#1A1917",
  border: "#1E1D1A",
  borderLit: "#2A2824",
  text: "#D8D2C4",
  textSoft: "#8A8477",
  textGhost: "#4A463F",
  amber: "#C98B3F",
  amberDim: "#8B6530",
  amberGlow: "rgba(201,139,63,0.12)",
  amberMid: "rgba(201,139,63,0.22)",
  amberFaint: "rgba(201,139,63,0.05)",
  rust: "#A0522D",
  concrete: "#2A2825",
};

// Material-inspired radius scale
const R = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html { height:-webkit-fill-available; }
  body { min-height:100vh; min-height:-webkit-fill-available; }

  ::-webkit-scrollbar { width:2px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:${P.borderLit}; border-radius:4px; }

  @keyframes grainShift {
    0%, 100% { transform: translate(0,0); }
    10% { transform: translate(-2%,-3%); }
    30% { transform: translate(3%,2%); }
    50% { transform: translate(-1%,4%); }
    70% { transform: translate(2%,-2%); }
    90% { transform: translate(-3%,1%); }
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes breathe { 0%,100% { opacity:0.35; } 50% { opacity:1; } }
  @keyframes pulseRing {
    0% { box-shadow: 0 0 0 0 rgba(201,139,63,0.3); }
    70% { box-shadow: 0 0 0 16px rgba(201,139,63,0); }
    100% { box-shadow: 0 0 0 0 rgba(201,139,63,0); }
  }
  @keyframes drift { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
  @keyframes flicker { 0%,97%,100% { opacity:1; } 98% { opacity:0.6; } 99% { opacity:0.9; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scanDrift { 0% { top:-2px; } 100% { top:calc(100% + 2px); } }
  @keyframes ripple {
    0% { transform:scale(0.8); opacity:0.6; }
    100% { transform:scale(2.5); opacity:0; }
  }
  @keyframes bodyPulse {
    0%,100% { opacity:0.5; }
    50% { opacity:0.9; }
  }
  @keyframes fabGlow {
    0%,100% { box-shadow: 0 8px 32px rgba(201,139,63,0.4), 0 0 0 0 rgba(201,139,63,0.15); }
    50% { box-shadow: 0 12px 48px rgba(201,139,63,0.65), 0 0 0 22px rgba(201,139,63,0); }
  }
  @keyframes ringOut {
    from { transform: scale(1); opacity: 0.5; }
    to { transform: scale(2.4); opacity: 0; }
  }
`;

const sans = `'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif`;
const mono = `'JetBrains Mono', monospace`;
const serif = `'Playfair Display', Georgia, serif`;

// ─── REUSABLE COMPONENTS ───

function Grain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.width = 256; c.height = 256;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=14;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={canvasRef} style={{
    position:"fixed", inset:0, width:"100%", height:"100%",
    pointerEvents:"none", zIndex:9998, opacity:0.45,
    mixBlendMode:"overlay", animation:"grainShift 0.8s steps(4) infinite",
  }}/>;
}

// Ambient amber glow — replaces topo pattern
function AmberGlow({ size = 220, opacity = 0.07, right = -60, top = -60 }) {
  return (
    <div style={{
      position: "absolute", right, top,
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle, rgba(201,139,63,${opacity}) 0%, transparent 70%)`,
      pointerEvents: "none",
    }}/>
  );
}

function SectionChip({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: R.full,
      background: P.amberFaint, border: `1px solid ${P.amberDim}`,
      marginBottom: 16,
    }}>
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: P.amber }}/>
      <span style={{
        fontFamily: mono, fontSize: 8, color: P.amber,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
      }}>{children}</span>
    </div>
  );
}

function PhaseTitle({ children }) {
  return (
    <p style={{
      fontFamily: serif, fontSize: 20, color: P.text,
      fontStyle: "italic", marginBottom: 18, lineHeight: 1.3, textAlign: "center",
    }}>{children}</p>
  );
}

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, gap: 0 }}>
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
            background: i < current ? P.amberDim : i === current ? P.amber : P.border,
            boxShadow: i === current ? `0 0 8px ${P.amber}80` : "none",
            transition: "all 0.3s",
          }}/>
          {i < total - 1 && (
            <div style={{
              width: 22, height: 1.5, flexShrink: 0,
              background: i < current ? P.amberDim : P.border,
              transition: "all 0.3s",
            }}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function BtnPrimary({ onClick, children, disabled = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? P.surfaceRaised : P.amber,
      border: "none", color: disabled ? P.textGhost : P.void,
      fontFamily: sans, fontSize: 13, fontWeight: 600,
      padding: "13px 36px", cursor: disabled ? "default" : "pointer",
      borderRadius: R.full, letterSpacing: "0.02em",
      boxShadow: disabled ? "none" : `0 4px 18px rgba(201,139,63,0.35)`,
      transition: "all 0.2s",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>{children}</button>
  );
}

function BtnSecondary({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: "none",
      border: `1px solid ${P.borderLit}`, color: P.textSoft,
      fontFamily: sans, fontSize: 13, fontWeight: 400,
      padding: "12px 28px", cursor: "pointer",
      borderRadius: R.full, transition: "all 0.2s",
      ...style,
    }}>{children}</button>
  );
}

function BtnGhost({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: P.amberFaint,
      border: `1px solid ${P.amberDim}`, color: P.amber,
      fontFamily: sans, fontSize: 13, fontWeight: 500,
      padding: "12px 32px", cursor: "pointer",
      borderRadius: R.full, transition: "all 0.2s",
      ...style,
    }}>{children}</button>
  );
}

function StatusBar({ isActive, onToggle }) {
  return (
    <div style={{
      padding: "10px 16px", borderBottom: `1px solid ${P.border}`,
      background: P.deep,
    }}>
      <div style={{
        display: "flex", background: P.surface, borderRadius: R.full,
        padding: 3, border: `1px solid ${P.border}`, gap: 2,
      }}>
        {[
          { key: false, label: "surface" },
          { key: true, label: "underground" },
        ].map(({ key, label }) => {
          const active = key === isActive;
          return (
            <button
              key={label}
              onClick={() => { if (!active) onToggle(); }}
              style={{
                flex: 1, padding: "8px 0", borderRadius: R.full,
                background: active ? (isActive ? P.amberFaint : P.surfaceRaised) : "transparent",
                border: active ? `1px solid ${isActive ? P.amberDim : P.borderLit}` : "1px solid transparent",
                cursor: active ? "default" : "pointer",
                fontFamily: mono, fontSize: "8.5px", letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: active ? (isActive ? P.amber : P.textSoft) : P.textGhost,
                transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              {isActive && active && (
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: P.amber, animation: "breathe 2s ease infinite",
                  flexShrink: 0,
                }}/>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Nav({ screen, setScreen }) {
  const tabs = [
    { id: "capture", label: "Capture", icon: "◎" },
    { id: "map", label: "Map", icon: "◫" },
    { id: "about", label: "Probe", icon: "◬" },
  ];
  return (
    <div style={{
      display: "flex", background: P.deep,
      borderTop: `1px solid ${P.border}`,
      padding: "8px 12px",
      paddingBottom: `calc(8px + env(safe-area-inset-bottom, 0px))`,
      gap: 4,
    }}>
      {tabs.map(t => {
        const active = screen === t.id;
        return (
          <button key={t.id} onClick={() => setScreen(t.id)} style={{
            flex: 1, background: "none", border: "none",
            cursor: "pointer", padding: 0,
          }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "7px 16px",
              borderRadius: R.full,
              background: active ? P.amberGlow : "transparent",
              border: active ? `1px solid ${P.amberFaint}` : "1px solid transparent",
              transition: "all 0.22s",
            }}>
              <span style={{ fontSize: 15, color: active ? P.amber : P.textGhost, lineHeight: 1 }}>{t.icon}</span>
              <span style={{
                fontFamily: sans, fontSize: 10, fontWeight: 500,
                color: active ? P.amber : P.textGhost, letterSpacing: "0.03em",
              }}>{t.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ISOLATION COMPASS — 2D gestural SAM-like input
// ═══════════════════════════════════════════════
function IsolationCompass({ value, onChange }) {
  const padRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const signal = getCompassSignal(value.x, value.y);

  const getPos = (e) => {
    const rect = padRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleStart = (e) => { e.preventDefault(); setDragging(true); onChange(getPos(e)); };
  const handleMove = (e) => { if (dragging) { e.preventDefault(); onChange(getPos(e)); } };
  const handleEnd = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      const up = () => setDragging(false);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchend", up);
      return () => { window.removeEventListener("mouseup", up); window.removeEventListener("touchend", up); };
    }
  }, [dragging]);

  return (
    <div style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}>
      <div
        ref={padRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          position: "relative", width: "100%", aspectRatio: "1",
          background: P.surface, borderRadius: R.lg,
          border: `1px solid ${P.border}`,
          cursor: "crosshair", touchAction: "none", overflow: "hidden",
          userSelect: "none", WebkitUserSelect: "none",
          boxShadow: `0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        {/* Subtle dot grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill={P.borderLit}/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>

        {/* Axis lines */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, background: P.borderLit, opacity: 0.6 }}/>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: P.borderLit, opacity: 0.6 }}/>

        {/* Quadrant axis labels */}
        {[
          { text: "CROWDED", x: "3%", y: "50%", transform: "translateY(-50%)", ta: "left" },
          { text: "EMPTY", x: null, right: "3%", y: "50%", transform: "translateY(-50%)", ta: "right" },
          { text: "SEEN", x: "50%", y: "4%", transform: "translateX(-50%)", ta: "center" },
          { text: "UNSEEN", x: "50%", y: null, bottom: "4%", transform: "translateX(-50%)", ta: "center" },
        ].map((l, i) => (
          <span key={i} style={{
            position: "absolute",
            left: l.x || undefined, right: l.right || undefined,
            top: l.y || undefined, bottom: l.bottom || undefined,
            transform: l.transform,
            fontFamily: mono, fontSize: 6.5, color: P.textGhost,
            letterSpacing: "0.2em", textTransform: "uppercase",
            pointerEvents: "none", zIndex: 2,
          }}>{l.text}</span>
        ))}

        {/* Corner state labels */}
        {[
          { text: "Suffocating", left: "6%", bottom: "6%" },
          { text: "Swallowed", left: "6%", top: "6%" },
          { text: "Erased", right: "6%", bottom: "6%" },
          { text: "Drifting", right: "6%", top: "6%" },
        ].map((l, i) => (
          <span key={i} style={{
            position: "absolute", ...l, fontFamily: sans, fontSize: 9,
            color: P.textGhost, opacity: 0.35, letterSpacing: "0.02em",
            fontStyle: "italic", pointerEvents: "none",
          }}>{l.text}</span>
        ))}

        {/* Ripple on drag */}
        {dragging && (
          <div style={{
            position: "absolute",
            left: `${value.x * 100}%`, top: `${value.y * 100}%`,
            width: 44, height: 44, borderRadius: "50%",
            border: `1px solid ${P.amber}`,
            transform: "translate(-50%,-50%)",
            animation: "ripple 1s ease-out infinite",
            pointerEvents: "none",
          }}/>
        )}

        {/* Placement dot */}
        <div style={{
          position: "absolute",
          left: `${value.x * 100}%`, top: `${value.y * 100}%`,
          transform: "translate(-50%,-50%)", zIndex: 3,
          transition: dragging ? "none" : "left 0.15s, top 0.15s",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: P.amber, border: `2.5px solid ${P.text}`,
            boxShadow: `0 0 20px ${P.amber}90, 0 2px 8px rgba(0,0,0,0.5)`,
          }}/>
        </div>
      </div>

      {/* Signal pill */}
      <div style={{
        marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center",
        animation: dragging ? "none" : "fadeUp 0.2s ease",
        gap: 6,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center",
          padding: "6px 20px", borderRadius: R.full,
          background: P.amberFaint, border: `1px solid ${P.amberDim}`,
        }}>
          <p style={{
            fontFamily: serif, fontSize: 18, color: P.amber,
            fontStyle: "italic", fontWeight: 700, lineHeight: 1,
          }}>{signal}</p>
        </div>
        <p style={{
          fontFamily: sans, fontSize: 11, color: P.textGhost,
          letterSpacing: "0.03em",
        }}>
          from where you placed it
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// BODY MAP — tap where you feel it
// ═══════════════════════════════════════════════
function BodyMap({ selected, onToggle }) {
  return (
    <div style={{ width: "100%", maxWidth: 240, margin: "0 auto" }}>
      <div style={{
        background: P.surface, borderRadius: R.xl,
        border: `1px solid ${P.border}`,
        padding: "18px 0 10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        <svg viewBox="0 0 200 340" style={{ width: "100%", height: "auto" }}>
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.borderLit} stopOpacity="0.7"/>
              <stop offset="100%" stopColor={P.borderLit} stopOpacity="0.2"/>
            </linearGradient>
          </defs>

          <ellipse cx="100" cy="30" rx="20" ry="24" fill="none" stroke={P.borderLit} strokeWidth="1"/>
          <rect x="93" y="54" width="14" height="14" fill="none" stroke={P.borderLit} strokeWidth="0.8"/>
          <path d="M65 68 L65 180 Q65 195 80 195 L120 195 Q135 195 135 180 L135 68 Q120 62 100 62 Q80 62 65 68Z" fill="none" stroke={P.borderLit} strokeWidth="1"/>
          <path d="M65 75 L40 140 L32 195 Q28 210 38 210" fill="none" stroke={P.borderLit} strokeWidth="1"/>
          <path d="M135 75 L160 140 L168 195 Q172 210 162 210" fill="none" stroke={P.borderLit} strokeWidth="1"/>
          <path d="M80 195 L75 280 L70 320 Q68 330 78 330" fill="none" stroke={P.borderLit} strokeWidth="1"/>
          <path d="M120 195 L125 280 L130 320 Q132 330 122 330" fill="none" stroke={P.borderLit} strokeWidth="1"/>

          {BODY_ZONES.map(zone => {
            const active = selected.includes(zone.id);
            return (
              <g key={zone.id} onClick={() => onToggle(zone.id)} style={{ cursor: "pointer" }}>
                <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry}
                  fill={active ? P.amber : "transparent"}
                  fillOpacity={active ? 0.18 : 0}
                  stroke={active ? P.amber : "transparent"}
                  strokeWidth={active ? 1.5 : 0}
                  style={{ transition: "all 0.2s" }}
                />
                {active && (
                  <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry}
                    fill="none" stroke={P.amber} strokeWidth="0.5"
                    opacity="0.4"
                    style={{ animation: "bodyPulse 2s ease infinite" }}
                  />
                )}
                {active && (
                  <text x={zone.cx} y={zone.cy + zone.ry + 12}
                    textAnchor="middle" fill={P.amber}
                    style={{ fontFamily: sans, fontSize: 8, letterSpacing: "0.04em" }}
                  >{zone.label}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p style={{
        fontFamily: sans, fontSize: 11, color: P.textGhost, textAlign: "center",
        marginTop: 10, letterSpacing: "0.02em",
      }}>
        {selected.length === 0 ? "tap where you feel it" : `${selected.length} zone${selected.length > 1 ? "s" : ""} marked`}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════
// RESIDUE NOTE — post-capture micro-reflection
// ═══════════════════════════════════════════════
function ResidueNote({ value, onChange, prompt }) {
  return (
    <div style={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <div style={{
        padding: "16px 18px", background: P.surface,
        border: `1px solid ${P.border}`, marginBottom: 14,
        borderRadius: R.lg,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}>
        <p style={{
          fontFamily: serif, fontSize: 14, color: P.textSoft,
          fontStyle: "italic", lineHeight: 1.55,
        }}>
          "{prompt}"
        </p>
      </div>
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          onChange={e => { if (e.target.value.length <= 80) onChange(e.target.value); }}
          placeholder="a few words..."
          rows={3}
          style={{
            width: "100%", background: P.surface,
            border: `1px solid ${value ? P.amberDim : P.border}`,
            color: P.text, fontFamily: sans, fontSize: 13,
            padding: "14px 16px", resize: "none",
            lineHeight: 1.6, outline: "none",
            transition: "border-color 0.2s",
            borderRadius: R.md,
          }}
          onFocus={e => e.target.style.borderColor = P.amber}
          onBlur={e => e.target.style.borderColor = value ? P.amberDim : P.border}
        />
        <span style={{
          position: "absolute", right: 10, bottom: 8,
          fontFamily: mono, fontSize: 8, color: P.textGhost,
        }}>{value.length}/80</span>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// CAPTURE SCREEN — full probe flow
// ═══════════════════════════════════════════════
function CaptureScreen({ isActive, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [phase, setPhase] = useState("idle");
  const streamRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  const [compassPos, setCompassPos] = useState({ x: 0.5, y: 0.5 });
  const [bodyZones, setBodyZones] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [noteText, setNoteText] = useState("");
  const [currentPrompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  const allStations = [...new Set(METRO_LINES.flatMap(l => l.stops))].sort();
  const signal = getCompassSignal(compassPos.x, compassPos.y);
  const totalSteps = 5;

  useEffect(() => {
    if (phase === "viewfinder" && streamRef.current && videoRef.current) {
      const v = videoRef.current;
      v.srcObject = streamRef.current;
      v.onloadedmetadata = () => { v.play().then(() => setVideoReady(true)).catch(() => {}); };
      if (v.readyState >= 1) { v.play().then(() => setVideoReady(true)).catch(() => {}); }
    }
  }, [phase]);

  const startCamera = useCallback(async () => {
    try {
      setVideoReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      setPhase("viewfinder");
    } catch { alert("Camera access is needed for the probe."); }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas || v.readyState < 2) return;
    const ctx = canvas.getContext("2d");
    const vw = v.videoWidth || 400;
    const vh = v.videoHeight || 400;
    canvas.width = 400; canvas.height = 400;
    const side = Math.min(vw, vh);
    ctx.drawImage(v, (vw - side) / 2, (vh - side) / 2, side, side, 0, 0, 400, 400);
    const tmp = document.createElement("canvas");
    tmp.width = 20; tmp.height = 20;
    const tc = tmp.getContext("2d");
    tc.drawImage(canvas, 0, 0, 20, 20);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tmp, 0, 0, 400, 400);
    tmp.width = 40; tmp.height = 40;
    tc.drawImage(canvas, 0, 0, 40, 40);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(tmp, 0, 0, 400, 400);
    ctx.globalAlpha = 1.0;
    const img = ctx.getImageData(0, 0, 400, 400);
    for (let i = 0; i < img.data.length; i += 4) {
      const avg = img.data[i] * 0.3 + img.data[i + 1] * 0.59 + img.data[i + 2] * 0.11;
      img.data[i] = img.data[i] * 0.25 + avg * 0.75;
      img.data[i + 1] = img.data[i + 1] * 0.25 + avg * 0.75;
      img.data[i + 2] = img.data[i + 2] * 0.25 + avg * 0.75;
      img.data[i] *= 0.85; img.data[i + 1] *= 0.85; img.data[i + 2] *= 0.85;
      const n = (Math.random() - 0.5) * 50;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "rgba(180,120,50,0.1)";
    ctx.fillRect(0, 0, 400, 400);
    const grad = ctx.createRadialGradient(200, 200, 80, 200, 200, 280);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(8,8,8,0.7)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);
    ctx.strokeStyle = `${P.amber}88`; ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, 300, 300);
    ctx.strokeStyle = P.amber; ctx.lineWidth = 1.5;
    const d = (x, y, dx, dy) => { ctx.beginPath(); ctx.moveTo(x + dx * 16, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * 16); ctx.stroke(); };
    d(50, 50, 1, 1); d(350, 50, -1, 1); d(50, 350, 1, -1); d(350, 350, -1, -1);

    setCaptured(canvas.toDataURL("image/jpeg", 0.65));
    stopCamera();
    setPhase("compass");
  }, [stopCamera]);

  const submit = () => {
    onCapture({
      signal, station: selectedStation, image: captured,
      compass: compassPos, bodyZones, note: noteText, prompt: currentPrompt,
    });
    setPhase("done");
    setTimeout(() => {
      setCaptured(null); setCompassPos({ x: 0.5, y: 0.5 });
      setBodyZones([]); setSelectedStation(""); setNoteText("");
      setPhase("idle");
    }, 3000);
  };

  const reset = () => {
    stopCamera(); setCaptured(null); setCompassPos({ x: 0.5, y: 0.5 });
    setBodyZones([]); setSelectedStation(""); setNoteText(""); setPhase("idle");
  };

  const toggleBody = (id) => {
    setBodyZones(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
  };

  // ─── INACTIVE ───
  if (!isActive) return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 28px", position: "relative", overflow: "hidden",
    }}>
      <AmberGlow size={300} opacity={0.06} right="50%" top={-80}/>
      <div style={{
        width: 80, height: 80, borderRadius: R.xl,
        background: P.surface, border: `1px solid ${P.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 28,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <div style={{ width: 28, height: 28, border: `2px solid ${P.textGhost}`, borderRadius: 6 }}/>
      </div>
      <p style={{ fontFamily: serif, fontSize: 20, color: P.textSoft, textAlign: "center", fontStyle: "italic", marginBottom: 12 }}>
        You are on the surface.
      </p>
      <p style={{ fontFamily: sans, fontSize: 13, color: P.textGhost, textAlign: "center", lineHeight: 1.7, maxWidth: 240 }}>
        Enter the gate to descend. The probe only listens underground.
      </p>
    </div>
  );

  // ─── DONE ───
  if (phase === "done") return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 40, animation: "fadeUp 0.4s ease", position: "relative",
    }}>
      <AmberGlow size={260} opacity={0.1} right="50%" top="50%"/>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: `2px solid ${P.amber}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, animation: "pulseRing 2s ease infinite",
        background: P.amberFaint,
      }}>
        <span style={{ color: P.amber, fontSize: 22, fontFamily: sans }}>✓</span>
      </div>
      <p style={{ fontFamily: serif, fontSize: 18, color: P.text, fontStyle: "italic" }}>Residue left.</p>
      <p style={{ fontFamily: sans, fontSize: 12, color: P.textGhost, marginTop: 8 }}>
        your trace is on the map
      </p>
    </div>
  );

  // ─── MAIN FLOW ───
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", position: "relative", animation: "fadeUp 0.35s ease" }}>
      <canvas ref={canvasRef} style={{ display: "none" }}/>

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "36px 28px",
          position: "relative", overflow: "hidden",
        }}>
          <AmberGlow size={280} opacity={0.08} right="50%" top={-40}/>

          {/* FAB with expanding rings */}
          <div style={{ position: "relative", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[0, 0.6].map((delay, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 84, height: 84, borderRadius: "50%",
                border: `1px solid ${P.amber}50`,
                animation: `ringOut 2s ease-out ${delay}s infinite`,
                pointerEvents: "none",
              }}/>
            ))}
            <button onClick={startCamera} style={{
              width: 84, height: 84, borderRadius: "50%",
              background: P.amber, border: "none",
              cursor: "pointer", position: "relative", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "fabGlow 2.5s ease infinite",
              color: P.void, fontSize: 30,
              boxShadow: `0 8px 32px rgba(201,139,63,0.4)`,
            }}>
              ◎
            </button>
          </div>

          <p style={{ fontFamily: serif, fontSize: 22, color: P.text, textAlign: "center", fontStyle: "italic", marginBottom: 10 }}>
            Feel the spike?
          </p>
          <p style={{ fontFamily: sans, fontSize: 13, color: P.textGhost, textAlign: "center", lineHeight: 1.8, maxWidth: 260 }}>
            Hold up your viewfinder. Frame something. Five steps to leave your trace.
          </p>
        </div>
      )}

      {/* ── VIEWFINDER ── */}
      {phase === "viewfinder" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{
            position: "relative", width: "100%", maxWidth: 320,
            aspectRatio: "1", background: "#000", overflow: "hidden",
            borderRadius: R.lg, border: `1px solid ${P.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            <video ref={videoRef} autoPlay playsInline muted width={320} height={320}
              style={{ width: "100%", height: "100%", objectFit: "cover", WebkitTransform: "translateZ(0)", background: "#000" }}
            />
            <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 50px ${P.void}`, pointerEvents: "none" }}/>
            <div style={{
              position: "absolute", top: "15.6%", left: "15.6%", width: "68.8%", height: "68.8%",
              border: `1px solid ${P.amber}55`, pointerEvents: "none",
            }}>
              {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], i) => (
                <div key={i} style={{
                  position: "absolute",
                  [cy ? "bottom" : "top"]: -1, [cx ? "right" : "left"]: -1,
                  width: 12, height: 12,
                  [`border${cy ? "Bottom" : "Top"}`]: `1.5px solid ${P.amber}`,
                  [`border${cx ? "Right" : "Left"}`]: `1.5px solid ${P.amber}`,
                }}/>
              ))}
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: `${P.amber}25` }}/>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: `${P.amber}25` }}/>
            </div>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${P.amber}40, transparent)`,
              animation: "scanDrift 4s linear infinite", pointerEvents: "none",
            }}/>
          </div>
          <p style={{ fontFamily: sans, fontSize: 12, color: P.textGhost, textAlign: "center", marginTop: 16 }}>
            frame something. capture when ready.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <BtnSecondary onClick={reset}>Cancel</BtnSecondary>
            <BtnPrimary onClick={captureFrame} disabled={!videoReady}>
              {videoReady ? "Capture" : "Loading…"}
            </BtnPrimary>
          </div>
        </div>
      )}

      {/* ── ISOLATION COMPASS ── */}
      {phase === "compass" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px", overflow: "auto", animation: "slideUp 0.4s ease" }}>
          <StepIndicator current={0} total={totalSteps}/>

          <div style={{
            width: 72, height: 72, margin: "0 auto 16px", overflow: "hidden",
            border: `1px solid ${P.border}`, opacity: 0.85, flexShrink: 0,
            borderRadius: R.md,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}>
            <img src={captured} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
          </div>

          <PhaseTitle>Where in the isolation?</PhaseTitle>

          <IsolationCompass value={compassPos} onChange={setCompassPos}/>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <BtnGhost onClick={() => setPhase("bodymap")}>Next →</BtnGhost>
          </div>
        </div>
      )}

      {/* ── BODY MAP ── */}
      {phase === "bodymap" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px", overflow: "auto", animation: "slideUp 0.4s ease" }}>
          <StepIndicator current={1} total={totalSteps}/>

          <PhaseTitle>Where does it live in you?</PhaseTitle>

          <BodyMap selected={bodyZones} onToggle={toggleBody}/>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 18 }}>
            <BtnSecondary onClick={() => setPhase("compass")}>← Back</BtnSecondary>
            <BtnGhost onClick={() => setPhase("station")}>
              {bodyZones.length > 0 ? "Next →" : "Skip →"}
            </BtnGhost>
          </div>
        </div>
      )}

      {/* ── STATION SELECT ── */}
      {phase === "station" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px", overflow: "auto", animation: "slideUp 0.4s ease" }}>
          <StepIndicator current={2} total={totalSteps}/>

          <PhaseTitle>Where are you?</PhaseTitle>

          <div style={{ maxWidth: 320, margin: "0 auto", width: "100%" }}>
            {/* Signal summary card */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              background: P.surface, border: `1px solid ${P.border}`, marginBottom: 16,
              borderRadius: R.lg, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}>
              <div style={{
                width: 42, height: 42, overflow: "hidden",
                border: `1px solid ${P.border}`, flexShrink: 0, borderRadius: R.sm,
              }}>
                <img src={captured} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: R.full, background: P.amberFaint, border: `1px solid ${P.amberDim}`, marginBottom: 4 }}>
                  <p style={{ fontFamily: serif, fontSize: 13, color: P.amber, fontStyle: "italic" }}>{signal}</p>
                </div>
                <p style={{ fontFamily: sans, fontSize: 11, color: P.textGhost }}>
                  {bodyZones.length > 0 ? bodyZones.map(z => BODY_ZONES.find(b => b.id === z)?.label).join(", ") : "No body zones marked"}
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)} style={{
                width: "100%", background: P.surface, border: `1px solid ${P.border}`,
                color: P.text, fontFamily: sans, fontSize: 13, padding: "13px 40px 13px 16px",
                appearance: "none", cursor: "pointer", outline: "none",
                borderRadius: R.md,
              }}>
                <option value="">Select station…</option>
                {allStations.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <span style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                color: P.textGhost, fontSize: 10, pointerEvents: "none",
              }}>▾</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
            <BtnSecondary onClick={() => setPhase("bodymap")}>← Back</BtnSecondary>
            {selectedStation && (
              <BtnGhost onClick={() => setPhase("note")} style={{ animation: "fadeUp 0.2s ease" }}>
                Next →
              </BtnGhost>
            )}
          </div>
        </div>
      )}

      {/* ── RESIDUE NOTE ── */}
      {phase === "note" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px 20px", overflow: "auto", animation: "slideUp 0.4s ease" }}>
          <StepIndicator current={3} total={totalSteps}/>

          <PhaseTitle>Leave a trace.</PhaseTitle>

          <ResidueNote value={noteText} onChange={setNoteText} prompt={currentPrompt}/>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
            <BtnSecondary onClick={() => setPhase("station")}>← Back</BtnSecondary>
            <BtnPrimary onClick={submit}>Drop it here</BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════
// MAP SCREEN
// ═══════════════════════════════════════════════
function MapScreen({ signals }) {
  const [selectedLine, setSelectedLine] = useState(null);
  const [expandedStation, setExpandedStation] = useState(null);
  const all = [...GHOST_SEEDS, ...signals];
  const forStation = (s) => all.filter(x => x.station === s);
  const visible = selectedLine ? METRO_LINES.filter(l => l.name === selectedLine) : METRO_LINES;

  return (
    <div style={{
      flex: 1, overflow: "auto", padding: "20px 18px",
      fontFamily: sans, animation: "fadeUp 0.35s ease", position: "relative",
    }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: serif, fontSize: 24, color: P.text, fontWeight: 700, fontStyle: "italic" }}>
            Residue Map
          </h2>
          <p style={{ fontFamily: sans, fontSize: 12, color: P.textGhost, marginTop: 4 }}>
            {all.length} traces recorded
          </p>
        </div>
        <div style={{
          padding: "6px 16px", borderRadius: R.full,
          background: P.amberFaint, border: `1px solid ${P.amberDim}`,
          fontFamily: mono, fontSize: 13, color: P.amber, fontWeight: 600,
        }}>{all.length}</div>
      </div>

      {/* Pill chip filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={() => setSelectedLine(null)} style={{
          background: !selectedLine ? P.surfaceRaised : "none",
          border: `1px solid ${!selectedLine ? P.borderLit : P.border}`,
          color: !selectedLine ? P.textSoft : P.textGhost,
          fontFamily: sans, fontSize: 12, fontWeight: 500,
          padding: "6px 16px", cursor: "pointer", borderRadius: R.full,
          transition: "all 0.2s",
        }}>All</button>
        {METRO_LINES.map(l => {
          const active = selectedLine === l.name;
          return (
            <button key={l.name} onClick={() => setSelectedLine(l.name)} style={{
              background: active ? `${l.color}18` : "none",
              border: `1px solid ${active ? l.color : P.border}`,
              color: active ? l.color : P.textGhost,
              fontFamily: sans, fontSize: 12, fontWeight: 500,
              padding: "6px 14px", cursor: "pointer",
              borderRadius: R.full,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, opacity: active ? 1 : 0.4, display: "inline-block", flexShrink: 0 }}/>
              {l.name.replace(" Line", "")}
            </button>
          );
        })}
      </div>

      {/* Lines + Stations */}
      {visible.map(line => (
        <div key={line.name} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 3, background: line.color, borderRadius: R.full }}/>
            <span style={{
              fontSize: 11, color: line.color, letterSpacing: "0.1em",
              textTransform: "uppercase", fontWeight: 600, fontFamily: sans,
            }}>{line.name}</span>
          </div>
          <div style={{ paddingLeft: 10 }}>
            {line.stops.map((stop, i) => {
              const sigs = forStation(stop);
              const has = sigs.length > 0;
              const key = `${line.name}-${stop}`;
              const open = expandedStation === key;
              return (
                <div key={key} style={{ position: "relative" }}>
                  {i < line.stops.length - 1 && (
                    <div style={{ position: "absolute", left: 4.5, top: 14, bottom: 0, width: 1, background: `${line.color}20` }}/>
                  )}
                  <div
                    onClick={() => has && setExpandedStation(open ? null : key)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0", cursor: has ? "pointer" : "default", position: "relative" }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      border: `1.5px solid ${has ? line.color : P.border}`,
                      background: has ? `${line.color}18` : "transparent",
                      flexShrink: 0, marginTop: 3, position: "relative", zIndex: 1,
                    }}>
                      {has && (
                        <div style={{
                          position: "absolute", top: -5, right: -9, minWidth: 14, height: 14,
                          borderRadius: R.full, background: P.amber, fontSize: 8, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: P.void, padding: "0 3px", fontFamily: mono,
                        }}>{sigs.length}</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, color: has ? P.text : P.textGhost, fontFamily: sans }}>{stop}</span>
                      {open && (
                        <div style={{ marginTop: 8, animation: "fadeUp 0.25s ease" }}>
                          {sigs.map((sig, j) => (
                            <div key={sig.id || j} style={{
                              padding: "10px 12px", marginBottom: 5,
                              background: P.surface, border: `1px solid ${P.border}`,
                              borderRadius: R.md,
                              boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sig.note ? 6 : 0 }}>
                                <div style={{
                                  display: "inline-flex", padding: "2px 10px",
                                  borderRadius: R.full, background: P.amberFaint, border: `1px solid ${P.amberDim}`,
                                }}>
                                  <span style={{ fontSize: 11, color: P.amber, fontStyle: "italic", fontFamily: serif }}>{sig.signal}</span>
                                </div>
                                <span style={{ fontSize: 10, color: P.textGhost, fontFamily: mono }}>{sig.time || "now"}</span>
                              </div>
                              {sig.body && sig.body.length > 0 && (
                                <p style={{ fontSize: 10, color: P.textGhost, marginTop: 4, fontFamily: sans }}>
                                  {sig.body.map(z => BODY_ZONES.find(b => b.id === z)?.label).filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {sig.note && (
                                <p style={{ fontSize: 11, color: P.textSoft, fontStyle: "italic", marginTop: 5, lineHeight: 1.5, fontFamily: serif }}>
                                  "{sig.note}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════
// ABOUT SCREEN
// ═══════════════════════════════════════════════
function AboutScreen() {
  return (
    <div style={{
      flex: 1, overflow: "auto", padding: "24px 20px",
      fontFamily: sans, animation: "fadeUp 0.35s ease", position: "relative",
    }}>
      <div style={{ position: "relative", marginBottom: 32 }}>
        <p style={{ fontSize: 10, color: P.textGhost, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, fontFamily: mono }}>
          DDL 7007 / Design Probes
        </p>
        <h2 style={{ fontFamily: serif, fontSize: 32, color: P.text, fontWeight: 800, lineHeight: 1.1, fontStyle: "italic" }}>
          Residue
        </h2>
        <p style={{ fontSize: 13, color: P.textGhost, marginTop: 10, lineHeight: 1.7 }}>
          a design probe for how it feels to be alone in the metro.
        </p>
      </div>

      {/* Probe sequence */}
      <div style={{ marginBottom: 30 }}>
        <SectionChip>The Probe Sequence</SectionChip>
        {[
          ["01", "Enter the gate", "Swipe your transit card. The probe wakes."],
          ["02", "Feel the spike", "That moment of being alone in the crowd."],
          ["03", "Frame + Capture", "Hold up the Isolation Viewfinder. Photograph through the cutout. Auto-distorted for privacy."],
          ["04", "Isolation Compass", "Drag a point on a 2D field: Crowded/Empty vs Seen/Unseen. Your position generates a signal word."],
          ["05", "Body Map", "Tap where the isolation lives in your body. Head? Chest? Throat? Hands?"],
          ["06", "Drop at station", "Pin it to the metro map."],
          ["07", "Residue Note", "A micro-reflection. One provocative question. Your trace in 80 characters."],
          ["08", "Exit the gate", "Return to the surface. The probe sleeps."],
        ].map(([num, title, desc]) => (
          <div key={num} style={{
            display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14,
            borderBottom: `1px solid ${P.border}`,
          }}>
            {/* Numbered circle chip */}
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: P.amberFaint, border: `1px solid ${P.amberDim}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: mono, fontSize: 9, color: P.amber, fontWeight: 600,
            }}>{num}</div>
            <div>
              <p style={{ fontSize: 13, color: P.text, fontWeight: 600, marginBottom: 3 }}>{title}</p>
              <p style={{ fontSize: 12, color: P.textGhost, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Probe instruments */}
      <div style={{ marginBottom: 30 }}>
        <SectionChip>Probe Instruments</SectionChip>

        {[
          ["Isolation Compass", "A SAM-inspired 2D gestural input. Instead of selecting a word from a list, users position themselves on two axes: physical density (Crowded vs Empty) and social visibility (Seen vs Unseen). The intersection generates the signal word — \"Suffocating,\" \"Erased,\" \"Drifting\" — making the emotional labelling an embodied, spatial act rather than a cognitive one."],
          ["Body Map", "A somatic self-report. Users tap on a human silhouette to mark where they physically feel the isolation — chest tightness, throat constriction, hollow stomach, numb hands. This captures the embodied dimension of the experience that verbal probes miss."],
          ["Residue Notes", "A rotating Gaver-style provocation. Each capture session surfaces one question: \"Who didn't see you?\" or \"What were your hands doing?\" — designed to elicit post-hoc reflection without demanding logical recall. Capped at 80 characters to force compression and rawness."],
        ].map(([title, desc]) => (
          <div key={title} style={{
            padding: "16px 18px", border: `1px solid ${P.border}`,
            background: P.surface, marginBottom: 10,
            borderRadius: R.lg,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            <p style={{ fontSize: 13, color: P.text, fontWeight: 600, marginBottom: 6 }}>{title}</p>
            <p style={{ fontSize: 12, color: P.textGhost, lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Physical component */}
      <div style={{ marginBottom: 30 }}>
        <SectionChip>Physical Component</SectionChip>
        <div style={{
          padding: "24px 20px", border: `1px solid ${P.border}`, background: P.surface,
          borderRadius: R.xl,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 120, height: 72, background: P.void,
            border: `1px solid ${P.borderLit}`, borderRadius: R.sm,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 30, height: 30, border: `2px solid ${P.textGhost}`, borderRadius: 4 }}/>
          </div>
          <p style={{ fontSize: 10, color: P.textGhost, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", fontFamily: mono }}>
            Black Cardstock · Square Cutout · Business Card Size
          </p>
        </div>
      </div>

      {/* Theory */}
      <div style={{ marginBottom: 30 }}>
        <SectionChip>Theoretical Grounding</SectionChip>
        {[
          ["Non-Places", "Marc Augé", "Metro stations strip identity. You become 'passenger.' This probe re-inscribes subjectivity onto sterile space."],
          ["Cultural Probes", "Gaver, Dunne & Pacenti", "Provocation over precision. The Isolation Compass and rotating prompts are intentionally strange — designed to elicit felt experience, not survey data."],
          ["Bridge & Door", "Georg Simmel", "The viewfinder is the door (separation). The shared map is the bridge (connection). The body map turns inward."],
          ["Self-Assessment Manikin", "Bradley & Lang", "The Isolation Compass adapts SAM's dimensional approach: instead of valence/arousal, it maps crowdedness/visibility — axes specific to transit isolation."],
        ].map(([title, author, desc]) => (
          <div key={title} style={{
            borderLeft: `3px solid ${P.amberDim}`,
            paddingLeft: 16, marginBottom: 18,
            borderRadius: `0 0 0 2px`,
          }}>
            <p style={{ fontSize: 13, color: P.text, fontWeight: 600, marginBottom: 2 }}>{title}</p>
            <p style={{ fontSize: 11, color: P.amber, opacity: 0.7, marginBottom: 5, fontStyle: "italic", fontFamily: serif }}>{author}</p>
            <p style={{ fontSize: 12, color: P.textGhost, lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Closing quote */}
      <div style={{
        padding: "20px 22px", border: `1px solid ${P.border}`,
        background: P.amberFaint, borderRadius: R.lg,
        marginBottom: 24,
      }}>
        <p style={{
          fontFamily: serif, fontSize: 15, color: P.textSoft,
          fontStyle: "italic", textAlign: "center", lineHeight: 1.6,
        }}>
          "the thing you felt — someone else felt it at the same spot."
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function ResidueApp() {
  const [screen, setScreen] = useState("capture");
  const [isActive, setIsActive] = useState(false);
  const [userSignals, setUserSignals] = useState([]);

  const handleCapture = (data) => {
    setUserSignals(prev => [...prev, {
      id: Date.now(), station: data.station, signal: data.signal,
      time: "now", line: METRO_LINES.find(l => l.stops.includes(data.station))?.name || "Unknown",
      compass: data.compass, body: data.bodyZones, note: data.note, prompt: data.prompt,
    }]);
  };

  return (
    <div style={{
      width: "100%", maxWidth: 420, margin: "0 auto",
      height: "100vh", height: "-webkit-fill-available",
      display: "flex", flexDirection: "column",
      background: P.void, color: P.text,
      fontFamily: sans, position: "relative", overflow: "hidden",
      borderLeft: `1px solid ${P.border}`, borderRight: `1px solid ${P.border}`,
    }}>
      <style>{CSS}</style>
      <Grain/>

      {/* Header */}
      <div style={{
        padding: "14px 18px 12px",
        paddingTop: "calc(14px + env(safe-area-inset-top, 0px))",
        borderBottom: `1px solid ${P.border}`, background: P.deep,
        position: "relative", overflow: "hidden",
      }}>
        {/* Ambient amber glow top-right */}
        <AmberGlow size={180} opacity={0.09} right={-50} top={-50}/>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Rounded logo mark */}
            <div style={{
              width: 38, height: 38, borderRadius: R.lg,
              background: P.amberFaint, border: `1px solid ${P.amberDim}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 2px 12px rgba(201,139,63,0.2)`,
            }}>
              <div style={{
                width: 11, height: 11, borderRadius: "50%",
                background: P.amber, animation: "breathe 3s ease infinite",
                boxShadow: `0 0 10px ${P.amber}80`,
              }}/>
            </div>
            <div>
              <h1 style={{
                fontFamily: serif, fontSize: 20, fontWeight: 800, fontStyle: "italic",
                color: P.text, lineHeight: 1, animation: "flicker 6s ease infinite",
              }}>Residue</h1>
              <p style={{ fontFamily: mono, fontSize: 7, color: P.textGhost, letterSpacing: "0.1em", marginTop: 3 }}>
                transit isolation probe
              </p>
            </div>
          </div>
          {/* Version pill */}
          <div style={{
            padding: "3px 10px", borderRadius: R.full,
            background: P.surface, border: `1px solid ${P.border}`,
            fontFamily: mono, fontSize: 8, color: P.textGhost, letterSpacing: "0.08em",
          }}>v2</div>
        </div>
      </div>

      <StatusBar isActive={isActive} onToggle={() => setIsActive(!isActive)}/>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {screen === "capture" && <CaptureScreen isActive={isActive} onCapture={handleCapture}/>}
        {screen === "map" && <MapScreen signals={userSignals}/>}
        {screen === "about" && <AboutScreen/>}
      </div>

      <Nav screen={screen} setScreen={setScreen}/>
    </div>
  );
}
