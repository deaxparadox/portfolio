import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────── */
const C = {
  bg:       "#060500",
  bg2:      "#0d0b00",
  gold:     "#f5c518",
  goldLt:   "#ffd84d",
  goldDk:   "#c49a00",
  amber:    "#e8900a",
  cream:    "#fff8e7",
  txt:      "#f0ead8",
  dim:      "rgba(240,234,216,0.50)",
  dimLo:    "rgba(240,234,216,0.30)",
  border:   "rgba(245,197,24,0.15)",
  borderHv: "rgba(245,197,24,0.42)",
  glow:     "rgba(245,197,24,0.18)",
};

const ease = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const TRANSITION = `all 0.70s ${ease}`;

/* ─────────────────────────────────────────────
   DATA  —  4 narrative acts from one role
───────────────────────────────────────────── */
const CHAPTERS = [
  {
    id: "01", total: "04",
    act:  "The Foundation",
    role: "Python Developer",
    company: "Excellence Technologies",
    period: "Jan 2025 — Present",
    location: "Gurugram, India",
    classification: "BACKEND ENGINEERING",
    status: "ACTIVE",
    headline: "Building the core infrastructure.",
    narrative:
      "Architected e-commerce APIs using Django REST Framework — clean, scalable, production-hardened. Established authentication flows, Redis caching patterns, and database schema conventions the team builds on today.",
    detail:
      "Sub-200ms API response times across all endpoints. PostgreSQL schema design with optimised indexing. Redis-backed session and cache layers serving thousands of daily requests.",
    metric: { value: "<200ms", label: "API Response" },
    tags: ["Django", "FastAPI", "DRF", "PostgreSQL", "Redis"],
  },
  {
    id: "02", total: "04",
    act:  "The Intelligence Layer",
    role: "AI Systems Engineer",
    company: "Excellence Technologies",
    period: "Mar 2025 — Present",
    location: "Remote",
    classification: "GENERATIVE AI",
    status: "DEPLOYED",
    headline: "Automating what took humans hours.",
    narrative:
      "Developed LangGraph-powered pipelines extracting structured medical insights from assessment reports. Hybrid extraction strategy — AWS Textract for image-based PDFs, standard parsers for text. Auto-generates formatted clinical reports at the end.",
    detail:
      "60% reduction in document processing time. Handles any PDF format reliably — scanned, digital, or mixed. Integrates directly into the clinical workflow.",
    metric: { value: "60%", label: "Time Saved" },
    tags: ["LangGraph", "LangChain", "OpenAI", "AWS Textract", "RAG"],
  },
  {
    id: "03", total: "04",
    act:  "The Voice System",
    role: "Realtime Systems Engineer",
    company: "Excellence Technologies",
    period: "Jun 2025 — Present",
    location: "Remote",
    classification: "REALTIME / VOICE AI",
    status: "LIVE",
    headline: "Real-time intelligence. Human-quality voice.",
    narrative:
      "Designed and shipped Vgents — a real-time voice agent platform supporting multiple AI personas and concurrent user sessions. Strict session isolation via single-use token auth. WebSocket control plane for sub-100ms coordination.",
    detail:
      "LiveKit for audio transport. Twilio SIP for telephony. Each session cryptographically isolated. Simultaneous multi-user, multi-persona support at scale.",
    metric: { value: "<100ms", label: "Voice Latency" },
    tags: ["LiveKit", "Twilio SIP", "WebSockets", "FastAPI", "Docker"],
  },
  {
    id: "04", total: "04",
    act:  "The Infrastructure",
    role: "Cloud & DevOps Engineer",
    company: "Excellence Technologies",
    period: "Jan 2025 — Present",
    location: "Multi-Cloud",
    classification: "CLOUD / DEVOPS",
    status: "RUNNING",
    headline: "Three clouds. Zero downtime.",
    narrative:
      "Operating production workloads across AWS, Azure, and GCP simultaneously. Containerised deployments with Docker, Nginx reverse proxy, SSL termination, and Linux server hardening — all maintained alongside active feature delivery.",
    detail:
      "Fully containerised with Docker. Nginx reverse proxy + SSL. Automated deployment pipelines across three cloud providers. Zero unplanned downtime.",
    metric: { value: "3×", label: "Cloud Platforms" },
    tags: ["Docker", "AWS", "Azure", "GCP", "Nginx", "Linux"],
  },
];

/* ─────────────────────────────────────────────
   CARD TRANSFORM PER OFFSET
───────────────────────────────────────────── */
function cardStyle(offset) {
  const shared = { transition: TRANSITION, position: "absolute", inset: 0 };
  switch (offset) {
    case 0:  return { ...shared, opacity: 1,    transform: "translateY(0px)   rotate(-0.5deg) scale(1)",    zIndex: 20, boxShadow: `0 0 80px ${C.glow}, 0 44px 100px rgba(0,0,0,0.75)`, background: "rgba(15,12,0,0.94)", borderColor: C.borderHv };
    case 1:  return { ...shared, opacity: 0.52, transform: "translateY(16px)  rotate(0.9deg)  scale(0.965)", zIndex: 15, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",  background: "rgba(11,9,0,0.80)", borderColor: C.border };
    case 2:  return { ...shared, opacity: 0.28, transform: "translateY(28px)  rotate(1.6deg)  scale(0.930)", zIndex: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.4)",  background: "rgba(9,7,0,0.70)",  borderColor: "rgba(245,197,24,0.07)" };
    case 3:  return { ...shared, opacity: 0.12, transform: "translateY(38px)  rotate(2.2deg)  scale(0.900)", zIndex: 5,  boxShadow: "none",                           background: "rgba(8,6,0,0.60)",  borderColor: "rgba(245,197,24,0.04)" };
    case -1: return { ...shared, opacity: 0.22, transform: "translateY(-18px) rotate(-1.8deg) scale(0.960)", zIndex: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.4)",   background: "rgba(11,9,0,0.75)", borderColor: "rgba(245,197,24,0.10)" };
    default: return { ...shared, opacity: 0,    transform: "translateY(60px)  scale(0.88)",                  zIndex: 0,  pointerEvents: "none",                       background: "rgba(8,6,0,0.5)",  borderColor: "transparent" };
  }
}

/* ─────────────────────────────────────────────
   DOSSIER CARD
───────────────────────────────────────────── */
function DossierCard({ chapter, offset }) {
  const cs = cardStyle(offset);
  const isActive = offset === 0;

  return (
    <div style={{
      ...cs,
      borderRadius: 14,
      border: `1px solid ${cs.borderColor}`,
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      overflow: "hidden",
      pointerEvents: isActive ? "auto" : "none",
    }}>

      {/* top accent bar — gold on active */}
      <div style={{
        height: 3,
        background: isActive
          ? `linear-gradient(90deg, ${C.goldDk}, ${C.goldLt}, ${C.goldDk})`
          : "rgba(245,197,24,0.08)",
        transition: TRANSITION,
      }} />

      <div style={{ padding: "28px 32px 32px" }}>

        {/* header row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 22 }}>
          <span style={{
            fontFamily: "'DM Mono'", fontSize: 9, letterSpacing: "0.16em",
            textTransform: "uppercase", color: C.gold,
            background: "rgba(245,197,24,0.10)", border: `1px solid rgba(245,197,24,0.28)`,
            padding: "3px 11px", borderRadius: 3,
          }}>{chapter.status}</span>
          <span style={{ fontFamily: "'DM Mono'", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.dim }}>{chapter.classification}</span>
        </div>

        {/* act counter */}
        <div style={{
          fontFamily: "'DM Mono'", fontSize: 10, color: C.goldDk,
          letterSpacing: "0.12em", marginBottom: 8,
        }}>{chapter.id} / {chapter.total}</div>

        {/* role */}
        <div style={{
          fontFamily: "'Rubik Dirt'", fontSize: 26, color: C.cream,
          lineHeight: 1, letterSpacing: "-0.5px", marginBottom: 5,
        }}>{chapter.role}</div>

        {/* company + period */}
        <div style={{
          fontFamily: "'DM Mono'", fontSize: 11, color: C.goldDk,
          letterSpacing: "0.08em", marginBottom: 22,
        }}>{chapter.company} · {chapter.period}</div>

        {/* divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

        {/* narrative */}
        <div style={{
          fontFamily: "'Syne'", fontSize: 13, color: C.dim,
          lineHeight: 1.8, marginBottom: 24,
        }}>{chapter.narrative}</div>

        {/* metric */}
        <div style={{ display:"flex", alignItems:"baseline", gap: 10, marginBottom: 22 }}>
          <span style={{
            fontFamily: "'Rubik Dirt'", fontSize: 34, color: C.gold,
            lineHeight: 1, letterSpacing: "-0.5px",
          }}>{chapter.metric.value}</span>
          <span style={{
            fontFamily: "'DM Mono'", fontSize: 9, color: C.dim,
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>{chapter.metric.label}</span>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 18 }} />

        {/* tags */}
        <div style={{ display:"flex", flexWrap:"wrap", gap: 6 }}>
          {chapter.tags.map(t => (
            <span key={t} style={{
              fontFamily: "'DM Mono'", fontSize: 10, letterSpacing: "0.05em",
              padding: "4px 11px", borderRadius: 4,
              background: "rgba(245,197,24,0.07)",
              border: "1px solid rgba(245,197,24,0.20)",
              color: C.goldLt,
            }}>{t}</span>
          ))}
        </div>

        {/* footer */}
        <div style={{
          marginTop: 22, display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <span style={{ fontFamily:"'DM Mono'", fontSize: 9, color: C.dimLo, letterSpacing: "0.1em", textTransform:"uppercase" }}>
            📍 {chapter.location}
          </span>
          <span style={{ fontFamily:"'DM Mono'", fontSize: 9, color: C.dimLo, letterSpacing: "0.1em" }}>
            NK — {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LEFT NARRATIVE PANEL
───────────────────────────────────────────── */
function LeftPanel({ chapter, activeIdx, progress }) {
  const [visible, setVisible] = useState(true);
  const prevIdx = useRef(activeIdx);

  useEffect(() => {
    if (prevIdx.current !== activeIdx) {
      setVisible(false);
      const t = setTimeout(() => { setVisible(true); prevIdx.current = activeIdx; }, 220);
      return () => clearTimeout(t);
    }
  }, [activeIdx]);

  return (
    <div style={{
      flex: "0 0 46%", maxWidth: "46%",
      display: "flex", flexDirection: "column",
      justifyContent: "center",
      paddingRight: 40,
    }}>

      {/* section label */}
      <div style={{
        fontFamily: "'DM Mono'", fontSize: 10, color: C.gold,
        letterSpacing: "0.22em", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 40,
      }}>
        <span style={{ width: 40, height: 1, background: C.gold, display:"block", opacity:.6 }}/>
        Experience
      </div>

      {/* animated content block */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.35s ${ease}, transform 0.35s ${ease}`,
      }}>

        {/* chapter indicator */}
        <div style={{
          fontFamily: "'DM Mono'", fontSize: 11, color: C.goldDk,
          letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: 12,
        }}>Chapter {chapter.id} / {chapter.total}</div>

        {/* act title */}
        <h2 style={{
          fontFamily: "'Rubik Dirt'", fontSize: "clamp(40px, 4.5vw, 58px)",
          color: C.cream, lineHeight: 0.95, letterSpacing: "-1px",
          marginBottom: 28,
        }}>
          {chapter.act.split(" ").map((word, i) =>
            i === chapter.act.split(" ").length - 1
              ? <span key={i} style={{ color: C.gold }}> {word}</span>
              : <span key={i}>{word} </span>
          )}
        </h2>

        {/* headline */}
        <div style={{
          fontFamily: "'Syne'", fontSize: 15, fontWeight: 600,
          color: C.cream, lineHeight: 1.5, marginBottom: 16,
          letterSpacing: "0.01em",
        }}>{chapter.headline}</div>

        {/* detail note */}
        <div style={{
          fontFamily: "'Syne'", fontSize: 13, color: C.dim,
          lineHeight: 1.8, marginBottom: 40,
          paddingLeft: 16,
          borderLeft: `2px solid rgba(245,197,24,0.25)`,
        }}>{chapter.detail}</div>

      </div>

      {/* progress dots */}
      <div style={{ display:"flex", gap: 10, alignItems:"center", marginBottom: 24 }}>
        {CHAPTERS.map((_, i) => (
          <div key={i} style={{
            width: i === activeIdx ? 24 : 6,
            height: 6,
            borderRadius: 4,
            background: i === activeIdx ? C.gold : "rgba(245,197,24,0.20)",
            transition: TRANSITION,
            boxShadow: i === activeIdx ? `0 0 10px ${C.glow}` : "none",
          }}/>
        ))}
      </div>

      {/* scroll hint */}
      <div style={{
        fontFamily: "'DM Mono'", fontSize: 9, color: C.dimLo,
        letterSpacing: "0.14em", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 8,
        opacity: progress < 0.95 ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <span style={{
          display:"block", width:1, height:20,
          background: `linear-gradient(180deg, ${C.goldDk}, transparent)`,
        }}/>
        Scroll to progress
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────
   RIGHT CARD STACK
───────────────────────────────────────────── */
function CardStack({ activeIdx }) {
  return (
    <div style={{
      flex: "0 0 54%", maxWidth: "54%",
      display: "flex", alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      {/* card stage */}
      <div style={{
        position: "relative",
        width: "min(420px, 90%)",
        height: 500,
      }}>
        {CHAPTERS.map((ch, i) => {
          const offset = i - activeIdx;
          return (
            <DossierCard key={ch.id} chapter={ch} offset={offset} />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function ExperienceSection() {
  const sectionRef   = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress,  setProgress]  = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;

        const rect        = el.getBoundingClientRect();
        const totalH      = el.offsetHeight;
        const viewH       = window.innerHeight;
        const scrolled    = Math.max(0, -rect.top);
        const scrollable  = totalH - viewH;
        if (scrollable <= 0) return;

        const pct = Math.min(1, scrolled / scrollable);
        setProgress(pct);

        const idx = Math.min(
          CHAPTERS.length - 1,
          Math.floor(pct * CHAPTERS.length)
        );
        setActiveIdx(idx);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Font injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik+Dirt&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        body { background: ${C.bg}; margin: 0; }
        /* grain overlay */
        body::before {
          content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:200px;opacity:.3;
        }
      `}</style>

      {/* aurora blobs */}
      <div style={{
        position:"fixed",width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,#f5c518,transparent 70%)",
        top:-150,left:-150,opacity:.08,filter:"blur(100px)",pointerEvents:"none",zIndex:0,
      }}/>
      <div style={{
        position:"fixed",width:400,height:400,borderRadius:"50%",
        background:"radial-gradient(circle,#e8900a,transparent 70%)",
        bottom:-100,right:-80,opacity:.06,filter:"blur(100px)",pointerEvents:"none",zIndex:0,
      }}/>

      {/* scroll-space section */}
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          height: `${CHAPTERS.length * 100}vh`,
          zIndex: 1,
        }}
      >
        {/* sticky viewport */}
        <div style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          gap: 0,
          overflow: "hidden",
        }}>

          <LeftPanel
            chapter={CHAPTERS[activeIdx]}
            activeIdx={activeIdx}
            progress={progress}
          />

          <CardStack activeIdx={activeIdx} />

        </div>
      </section>
    </>
  );
}
