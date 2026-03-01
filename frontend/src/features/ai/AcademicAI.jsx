import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import "../../styles/AcademicAI.css";
import { sendAcademicMessage } from "./aiService";

/* ── AI Service bridge ── */
async function callAPI(messages) {
  try {
    // We send only the last user message to maintain the existing logic of the service
    const lastMsg = messages[messages.length - 1].content;
    const res = await sendAcademicMessage(lastMsg);
    return res.reply;
  } catch (err) {
    throw new Error(err.message || "Error getting response from service.");
  }
}

/* ─── palette (kept for dynamic inline styles only) ─── */
const PLM = {
  pink: "#f9a8c9",
  pinkLight: "#fce8f3",
  pinkBorder: "#f3b8d5",
  teal: "#7ec8c8",
  tealLight: "#e0f5f5",
  tealBorder: "#a8dcdc",
  green: "#00c96e",
  greenLight: "#ecfdf5",
  greenBorder: "#86efac",
  sage: "#b8e0c8",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
};

/* ─── static data ─── */

const TOOLBAR_ITEMS = [
  { label: "Deep Search", activeColor: "#00875a", activeBg: "#ecfdf5", activeBorder: "#86efac", prompt: "Analyze this with deep academic focus and technical depth." },
  { label: "Math Mode", activeColor: "#1a7a7a", activeBg: "#e0f5f5", activeBorder: "#7ec8c8", prompt: "Use LaTeX for all mathematical expressions and prioritize numerical accuracy." },
  { label: "Code Explain", activeColor: "#6d28d9", activeBg: "#f3f0ff", activeBorder: "#c4b5fd", prompt: "Provide detailed line-by-line explanations for any code fragments." },
  { label: "IEEE Cite", activeColor: "#c2410c", activeBg: "#fff7ed", activeBorder: "#fdba74", prompt: "Format all citations and references according to IEEE standards." },
  { label: "Exam Prep", activeColor: "#b5376e", activeBg: "#fce8f3", activeBorder: "#f9a8c9", prompt: "Format the response as clear study notes or exam-style review questions." },
];

/* ═══════════════════════════════════
   PURE DISPLAY COMPONENTS
═══════════════════════════════════ */

function Logo({ size = 20 }) {
  return (
    <span className="bs-logo" style={{ fontSize: size }}>
      <span className="bs-logo__bracket">[</span>
      <span className="bs-logo__text">byte</span>
      <span className="bs-logo__dot">.</span>
      <span className="bs-logo__text">scholar</span>
      <span className="bs-logo__bracket">]</span>
    </span>
  );
}

function Dots() {
  return (
    <div className="bs-dots">
      {[0, 0.18, 0.36].map((d, i) => (
        <div
          key={i}
          className="bs-dot"
          style={{ animation: `tdot 1.2s ${d}s infinite` }}
        />
      ))}
    </div>
  );
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="bs-code-block">
      <div className="bs-code-block__header">
        <span className="bs-code-block__lang">{lang?.toUpperCase() || "CODE"}</span>
        <button
          className="bs-code-block__copy"
          onClick={copy}
          style={{ color: copied ? PLM.green : PLM.muted }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bs-code-block__pre">{code}</pre>
    </div>
  );
}

function TextPart({ text }) {
  return (
    <div>
      {text.split("\n").map((line, li) => {
        if (!line.trim()) return <br key={li} />;
        const segs = [];
        const re = /\*\*(.*?)\*\*|`([^`]+)`/g;
        let last = 0, m;
        while ((m = re.exec(line)) !== null) {
          if (m.index > last) segs.push(<span key={`t${last}`}>{line.slice(last, m.index)}</span>);
          if (m[1] !== undefined)
            segs.push(<strong key={`b${m.index}`} style={{ color: PLM.text, fontWeight: 600 }}>{m[1]}</strong>);
          if (m[2] !== undefined)
            segs.push(<code key={`c${m.index}`} className="bs-inline-code">{m[2]}</code>);
          last = m.index + m[0].length;
        }
        if (last < line.length) segs.push(<span key={`e${last}`}>{line.slice(last)}</span>);
        return <p key={li} style={{ marginBottom: 7, lineHeight: 1.75 }}>{segs.length ? segs : line}</p>;
      })}
    </div>
  );
}

function MsgBody({ text }) {
  return (
    <div className="react-markdown-container">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

function MsgActions({ content }) {
  const [vis, setVis] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div
      className="bs-msg-actions"
      onMouseEnter={() => setVis(true)}
      onMouseLeave={() => setVis(false)}
      style={{ opacity: vis ? 1 : 0 }}
    >
      {vis && (
        <>
          <button
            className="msg-action"
            onClick={copy}
            style={{
              background: "#fff",
              border: `1px solid ${PLM.border}`,
              color: copied ? PLM.green : PLM.muted,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            className="msg-action"
            style={{ background: "#fff", border: `1px solid ${PLM.border}`, color: PLM.muted }}
          >
            View Sources
          </button>
          <button
            className="msg-action"
            style={{ background: "#fff", border: `1px solid ${PLM.border}`, color: PLM.muted }}
          >
            Regenerate
          </button>
        </>
      )}
    </div>
  );
}

function Avatar({ isUser }) {
  return (
    <div className={`bs-avatar ${isUser ? "bs-avatar--user" : "bs-avatar--bot"}`}>
      {isUser ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b5376e" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ) : (
        <span className="bs-avatar__label">BS</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN APP
═══════════════════════════════════ */
export default function AcademicAI() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [activeTools, setActiveTools] = useState(new Set());
  const [attachments, setAttachments] = useState([]);

  const bottomRef = useRef(null);
  const landTARef = useRef(null);
  const chatTARef = useRef(null);
  const fileInputRef = useRef(null);
  const cmdHist = useRef([]);
  const histIdx = useRef(-1);
  const activeIdRef = useRef(null);
  activeIdRef.current = activeId;

  const started = !!sessions.find(s => s.id === activeId);
  const active = sessions.find(s => s.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length, loading]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "k") { e.preventDefault(); handleNewSession(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!started) setTimeout(() => landTARef.current?.focus(), 80);
  }, [started]);

  const resizeTA = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  };

  const toggleTool = (label) => {
    setActiveTools(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const handleAttach = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, type: f.type }))]);
    e.target.value = "";
  };

  const removeAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const handleNewSession = () => {
    setActiveId(null);
    setInput("");
    setAttachments([]);
  };

  const send = useCallback(async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text || loading) return;

    cmdHist.current.unshift(text);
    histIdx.current = -1;
    setInput("");
    setAttachments([]);
    [landTARef, chatTARef].forEach(r => { if (r.current) r.current.style.height = "auto"; });

    let finalPrompt = text;
    if (activeTools.size > 0) {
      const activePrompts = TOOLBAR_ITEMS
        .filter(item => activeTools.has(item.label))
        .map(item => item.prompt)
        .join(" ");
      finalPrompt = `Instructions: ${activePrompts}\n\nQuery: ${text}`;
    }

    const userMsg = { role: "user", content: finalPrompt };
    const currentActiveId = activeIdRef.current;
    const isNew = !currentActiveId || !sessions.find(s => s.id === currentActiveId);

    if (isNew) {
      const id = Date.now();
      const title = text.slice(0, 46) + (text.length > 46 ? "…" : "");
      activeIdRef.current = id;
      setActiveId(id);
      setSessions(prev => [{ id, title, messages: [userMsg] }, ...prev]);
      setLoading(true);
      try {
        const reply = await callAPI([userMsg]);
        setSessions(prev => prev.map(s =>
          s.id === id ? { ...s, messages: [...s.messages, { role: "assistant", content: reply }] } : s
        ));
      } catch (err) {
        setSessions(prev => prev.map(s =>
          s.id === id ? { ...s, messages: [...s.messages, { role: "assistant", content: `Error: ${err.message}` }] } : s
        ));
      }
      setLoading(false);
    } else {
      const session = sessions.find(s => s.id === currentActiveId);
      if (!session) return;
      const updated = [...session.messages, userMsg];
      setSessions(prev => prev.map(s =>
        s.id === currentActiveId ? { ...s, messages: updated } : s
      ));
      setLoading(true);
      try {
        const reply = await callAPI(updated);
        setSessions(prev => prev.map(s =>
          s.id === currentActiveId
            ? { ...s, messages: [...s.messages, { role: "assistant", content: reply }] }
            : s
        ));
      } catch (err) {
        setSessions(prev => prev.map(s =>
          s.id === currentActiveId
            ? { ...s, messages: [...s.messages, { role: "assistant", content: `Error: ${err.message}` }] }
            : s
        ));
      }
      setLoading(false);
    }
  }, [input, loading, sessions]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = cmdHist.current;
      if (histIdx.current < h.length - 1) {
        histIdx.current++;
        setInput(h[histIdx.current]);
      }
    }
  };

  /* ── Attachment chip (reused in both views) ── */
  const AttachmentChips = () => (
    <div className="bs-attachments">
      {attachments.map((f, i) => (
        <div key={i} className="bs-attachment-tag">
          <span className="bs-attachment-tag__name">{f.name}</span>
          <button className="bs-attachment-tag__remove" onClick={() => removeAttachment(i)}>×</button>
        </div>
      ))}
    </div>
  );

  /* ── Attach icon button ── */
  const AttachBtn = ({ size = 38 }) => (
    <button
      className="attach-btn"
      onClick={() => fileInputRef.current?.click()}
      title="Attach file or image"
      style={{
        width: size,
        height: size,
        border: `1px solid ${PLM.border}`,
        background: "#f8fafc",
        color: PLM.muted,
      }}
    >
      <svg width={size >= 32 ? 16 : 13} height={size >= 32 ? 16 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
      </svg>
    </button>
  );

  /* ── Send icon button ── */
  const SendBtn = ({ size = 48, rounded = 12 }) => (
    <button
      className="send-btn"
      onClick={() => send()}
      disabled={!input.trim() || loading}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: input.trim() ? PLM.green : "#e2e8f0",
        cursor: input.trim() ? "pointer" : "default",
        color: input.trim() ? "#fff" : "#94a3b8",
      }}
    >
      <svg
        width={size >= 40 ? 18 : 14}
        height={size >= 40 ? 18 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
      </svg>
    </button>
  );

  return (
    <div className="bs-root">

      {/* ── HEADER ── */}
      <div className="bs-header">
        <div className="bs-header__logo" onClick={handleNewSession}>
          <Logo size={22} />
        </div>

        {started && active && (
          <div className="bs-header__breadcrumb">
            <span className="bs-header__breadcrumb-sep">/</span>
            <span className="bs-header__breadcrumb-title">{active.title}</span>
          </div>
        )}

        <div className="bs-header__actions">
          {started && (
            <>
              <button
                className="hdr-btn"
                onClick={handleNewSession}
                style={{ border: `1px solid ${PLM.border}`, background: "#f8fafc", color: PLM.muted }}
              >
                New chat
              </button>
            </>
          )}
          <button
            className="toggle-btn"
            onClick={() => setSideOpen(o => !o)}
            style={{ border: `1px solid ${PLM.border}`, background: "#fff", color: PLM.muted }}
            title={sideOpen ? "Close history" : "Open history"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sideOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="bs-body">

        {/* ══ MAIN ══ */}
        <div className="bs-main">

          {/* Mesh gradient blobs */}
          <div className="bs-bg">
            <div className="bs-bg__blob-teal" />
            <div className="bs-bg__blob-pink" />
            <div className="bs-bg__blob-sage" />
            <div className="bs-bg__blob-accent" />
          </div>
          {/* Grid overlay */}
          <div className="bs-grid" />

          {/* ══ LANDING ══ */}
          {!started && (
            <div className="bs-landing">

              {/* Hero */}
              <div className="bs-hero">
                <div className="bs-hero__logo-wrap">
                  <Logo size={48} />
                </div>
                <p className="bs-hero__tag">for engineers</p>
                <h2 className="bs-hero__headline">
                  for the <span className="bs-hero__hl-pink">algorithm-stuck,</span>
                  <br />
                  the <span className="bs-hero__hl-teal">deadline-chasing</span>
                  <br />
                  and the <span className="bs-hero__hl-sage">concept-obsessed.</span>
                </h2>

              </div>

              {/* Input bar */}
              <div className="bs-input-wrap">
                {attachments.length > 0 && <AttachmentChips />}

                <div className="land-wrap">
                  <AttachBtn size={38} />
                  <textarea
                    ref={landTARef}
                    className="bs-textarea"
                    value={input}
                    onChange={e => { setInput(e.target.value); resizeTA(e.target); }}
                    onKeyDown={handleKey}
                    placeholder="Ask about algorithms, OS, networks, ML, compilers..."
                    rows={1}
                  />
                  <SendBtn size={48} rounded={12} />
                </div>

              </div>
            </div>
          )}

          {/* ══ CHAT ══ */}
          {started && (
            <>
              {/* Messages */}
              <div className="bs-messages">
                {active.messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={i}
                      className={`bs-msg ${isUser ? "bs-msg--user" : "bs-msg--bot"}`}
                    >
                      <div className={`bs-msg__meta ${isUser ? "bs-msg__meta--user" : ""}`}>
                        <Avatar isUser={isUser} />
                        <span className={isUser ? "bs-msg__name--user" : "bs-msg__name--bot"}>
                          {isUser ? "You" : "byte.scholar"}
                        </span>
                      </div>

                      <div className={`bs-bubble ${isUser ? "bs-bubble--user" : "bs-bubble--bot"}`}>
                        {isUser
                          ? <p style={{ lineHeight: 1.75 }}>{msg.content}</p>
                          : <MsgBody text={msg.content} />
                        }
                      </div>

                      {!isUser && <MsgActions content={msg.content} />}
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {loading && (
                  <div className="bs-msg bs-msg--bot">
                    <div className="bs-msg__meta">
                      <Avatar isUser={false} />
                      <span className="bs-msg__name--bot">byte.scholar</span>
                    </div>
                    <div
                      className="bs-bubble bs-bubble--bot"
                      style={{ padding: 0 }}
                    >
                      <Dots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Chat input area */}
              <div className="bs-chat-input-area">
                {/* Toolbar */}
                <div className="bs-toolbar">
                  {TOOLBAR_ITEMS.map(({ label, activeColor, activeBg, activeBorder }) => {
                    const on = activeTools.has(label);
                    return (
                      <button
                        key={label}
                        className="tool-btn"
                        onClick={() => toggleTool(label)}
                        style={{
                          border: `1px solid ${on ? activeBorder : PLM.border}`,
                          background: on ? activeBg : "#f8fafc",
                          color: on ? activeColor : PLM.muted,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {attachments.length > 0 && <AttachmentChips />}

                <div className="chat-wrap">
                  <AttachBtn size={34} />
                  <textarea
                    ref={chatTARef}
                    className="bs-textarea"
                    value={input}
                    onChange={e => { setInput(e.target.value); resizeTA(e.target); }}
                    onKeyDown={handleKey}
                    placeholder="Ask a follow-up..."
                    rows={1}
                  />
                  <SendBtn size={42} rounded={10} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══ RIGHT SIDEBAR ══ */}
        <div
          className="bs-sidebar"
          style={{
            width: sideOpen ? 252 : 0,
            borderLeft: sideOpen ? `1px solid ${PLM.border}` : "none",
          }}
        >
          <div className="bs-sidebar__inner">

            <div className="bs-sidebar__heading">
              <p>Chat History</p>
            </div>

            <div className="bs-sidebar__new-wrap">
              <button
                className="new-sess"
                onClick={handleNewSession}
                style={{
                  border: `1px solid ${PLM.green}`,
                  background: PLM.greenLight,
                  color: "#00875a",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New session
              </button>
            </div>

            <div className="bs-sidebar__list">
              {sessions.length === 0 && (
                <p className="bs-sidebar__empty">
                  No sessions yet.<br />
                  <span>Start your first question.</span>
                </p>
              )}
              {sessions.map(s => {
                const isActive = s.id === activeId;
                return (
                  <div
                    key={s.id}
                    className="sess-item"
                    onClick={() => setActiveId(s.id)}
                    style={{
                      border: `1px solid ${isActive ? PLM.tealBorder : "transparent"}`,
                      background: isActive ? PLM.tealLight : "transparent",
                    }}
                  >
                    <div
                      className="sess-item__icon"
                      style={{
                        background: isActive ? PLM.teal : "#f1f5f9",
                        border: `1px solid ${isActive ? PLM.teal : PLM.border}`,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#fff" : "#94a3b8"} strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="sess-item__title"
                        style={{ color: isActive ? "#1a7a7a" : "#374151" }}
                      >
                        {s.title}
                      </div>
                      <div className="sess-item__count">
                        {s.messages.length} message{s.messages.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.py,.js,.cpp,.c,.java,.ts,.jsx,.tsx"
        onChange={handleAttach}
        style={{ display: "none" }}
      />

    </div>
  );
}
