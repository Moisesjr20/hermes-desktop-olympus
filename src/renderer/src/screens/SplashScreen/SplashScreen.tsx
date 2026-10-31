import { useEffect, useRef, useState } from "react";
import "./OlympusSplash.css";

interface SplashScreenProps {
  onFinished: () => void;
  status?: string;
  // When provided, a "Switch to local mode" escape hatch appears after a delay
  // so a stuck remote/SSH connect (e.g. an unresponsive "Starting SSH tunnel…")
  // never traps the user on the splash. Omitted in local mode.
  onSwitchToLocal?: () => void;
}

// How long the splash may sit on a remote/SSH step before we offer the escape
// hatch. Long enough that a normal first-connect (gateway provisioning, dist
// build, health waits) isn't interrupted, short enough to rescue a hang.
const ESCAPE_HATCH_DELAY_MS = 12000;

// 14 agentes-partículas distribuídos. Posições iniciais (edges da tela) +
// convergência no centro em trajetórias curvas via animations individuais.
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const radius = 400 + (i % 3) * 50; // dispersão em 3 anéis
  return {
    id: i,
    startX: Math.cos(angle) * radius,
    startY: Math.sin(angle) * radius,
    delay: 0.6 + (i * 0.05), // escalonado 0.6s→1.25s
  };
});

function SplashScreen({
  onFinished,
  status,
  onSwitchToLocal,
}: SplashScreenProps): React.JSX.Element {
  const [showEscape, setShowEscape] = useState(false);
  const canSwitch = Boolean(onSwitchToLocal);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onFinished();
  }, [onFinished]);

  useEffect(() => {
    if (!canSwitch) return;
    const timer = setTimeout(() => setShowEscape(true), ESCAPE_HATCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canSwitch]);

  return (
    <div className="splash-screen olympus-splash" ref={containerRef}>
      <svg
        className="splash-stage"
        viewBox="-500 -500 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        aria-label="OLYMPUS"
      >
        {/* vinheta radial sutil */}
        <defs>
          <radialGradient id="vignette" cx="0" cy="0" r="500" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1E3A5F" stopOpacity="0.4" />
            <stop offset="1" stopColor="#0A1628" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="-500" y="-500" width="1000" height="1000" fill="url(#vignette)" />

        {/* 14 agentes-partículas convergindo */}
        <g className="splash-particles">
          {PARTICLES.map((p) => (
            <circle
              key={p.id}
              className="splash-particle"
              r="4"
              cx={p.startX}
              cy={p.startY}
              style={{
                animationDelay: `${p.delay}s`,
                // CSS custom props pra animação ir de (startX,startY) → (0,0)
                ["--sx" as string]: `${p.startX}px`,
                ["--sy" as string]: `${p.startY}px`,
              }}
            />
          ))}
        </g>

        {/* Monte Olimpo (silhueta se forma após convergência) */}
        <g className="splash-mountain">
          <polygon
            className="splash-mountain-back"
            points="-350,250 -150,-50 50,250"
          />
          <polygon
            className="splash-mountain-main"
            points="-250,250 50,-200 350,250"
          />
          {/* raio Zeus desce no clímax */}
          <polygon
            className="splash-bolt"
            points="80,-200 20,80 80,80 -40,260 160,20 80,20 160,-200"
            filter="url(#glow)"
          />
          {/* flash do impacto */}
          <circle
            className="splash-flash"
            cx="80"
            cy="-200"
            r="40"
          />
        </g>

        {/* Wordmark OLYMPUS — materializa letter-by-letter */}
        <g className="splash-wordmark" transform="translate(0, 340)">
          <text
            textAnchor="middle"
            fontFamily="Orbitron, Impact, sans-serif"
            fontWeight="900"
            fontSize="80"
            letterSpacing="8"
            fill="#F1F5F9"
          >
            {"OLYMPUS".split("").map((ch, i) => (
              <tspan
                key={i}
                className="splash-char"
                style={{ animationDelay: `${3.5 + i * 0.06}s` }}
              >
                {ch}
              </tspan>
            ))}
          </text>
        </g>
      </svg>

      {onSwitchToLocal && showEscape && (
        <div className="splash-escape">
          <span className="splash-escape-hint">Taking longer than usual?</span>
          <button type="button" onClick={onSwitchToLocal}>
            Switch to local mode
          </button>
        </div>
      )}
      {status && <div className="splash-status">{status}</div>}
    </div>
  );
}

export default SplashScreen;
