"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo, LsThemeToggle } from "../components/ls/Components";
import * as I from "../components/ls/Icons";
import { saveDetection } from "../lib/history";
import { API_BASE } from "../lib/api";

const API = `${API_BASE}/api`;

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 50, height: 28, borderRadius: 999, position: 'relative', flexShrink: 0, background: on ? 'var(--primary)' : 'var(--surface-2)', transition: 'background 0.25s', boxShadow: 'inset 0 1px 4px oklch(0 0 0 / 0.1)' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 22, height: 22, borderRadius: 999, background: 'white', transition: 'left 0.25s var(--ease)', boxShadow: '0 1px 4px oklch(0 0 0 / 0.25)' }} />
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{children}</span>;
}

export default function SignPage() {
  const router = useRouter();
  const [speech, setSpeech] = useState(false);
  const [wordMode, setWordMode] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const cooldown = 1000;
  const [currentLetter, setCurrentLetter] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [sentence, setSentence] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLetterRef = useRef("");

  async function startDetection() {
    await fetch(`${API}/start-capture`, { method: "POST" });
    setDetecting(true);
  }

  useEffect(() => {
    if (!detecting) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: wordMode ? 1 : 0, speech: speech ? 1 : 0, voice_mode: "edge" }),
        });
        const data = await res.json();
        if (data.label !== "no match" && data.label !== "no confidence") {
          const letter = data.label;
          if (letter !== lastLetterRef.current) {
            lastLetterRef.current = letter;
            setCurrentLetter(letter);
            preload(letter);
          }
        }
      } catch { /* backend unreachable */ }
    }, cooldown);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [detecting, wordMode, speech, cooldown]);

  function acceptLetter() {
    if (!currentLetter) return;
    setCurrentWord(prev => prev + currentLetter);
    setCurrentLetter("");
    lastLetterRef.current = "";
  }

  function preload(text: string) {
    if (!text) return;
    fetch(`${API}/speech/preload/${encodeURIComponent(text)}`, { method: "POST" }).catch(() => {});
  }

  async function speakWord(word: string) {
    if (!word) return;
    await fetch(`${API}/speech/${encodeURIComponent(word)}`, { method: "POST" }).catch(() => {});
  }

  async function speakSentence(words: string[]) {
    const text = words.join(" ");
    if (text) saveDetection(text, 'Phrase');
    await speakWord(text);
  }

  function addWord() {
    if (!currentWord) return;
    saveDetection(currentWord, 'Word');
    setSentence(prev => {
      const next = [...prev, currentWord];
      preload(next.join(" "));
      return next;
    });
    setCurrentWord("");
    setCurrentLetter("");
    lastLetterRef.current = "";
  }

  function deleteLetter() {
    setCurrentWord(prev => [...prev].slice(0, -1).join(""));
    lastLetterRef.current = "";
  }

  function removeWord(index: number) {
    setSentence(prev => prev.filter((_, i) => i !== index));
  }

  function copyToClipboard() {
    if (!sentence.length) return;
    const text = sentence.join(" ");
    saveDetection(text, 'Phrase');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDetecting(false);
    setCurrentLetter("");
    await fetch(`${API}/stop-capture`, { method: "POST" }).catch(() => {});
  }

  return (
    <div className="ls-scope psl-main-fixed psl-sign-main" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav className="psl-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(12px,3vw,36px)', height: 58, borderBottom: '1px solid var(--line)', flexShrink: 0, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--ink-soft)', flexShrink: 0 }}>
            <I.ArrowLeft size={17} />
          </button>
          <Link href="/"><Logo size={26} /></Link>
        </div>
        <div className="psl-nav-badge" style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, justifyContent: 'center' }}>
          {detecting && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.5s ease-in-out infinite', flexShrink: 0 }} />}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Sign Detection</span>
          <span className="chip" style={{ background: 'var(--green-soft)', color: 'var(--primary-ink, var(--ink))', fontSize: 11 }}>PSL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LsThemeToggle />
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="psl-body psl-sign-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Controls */}
        <div className="psl-sidebar psl-sign-sidebar" style={{ width: 390, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, padding: 20, borderRight: '1px solid var(--line)', overflowY: 'auto', background: 'var(--bg)' }}>

          {/* Status badge */}
          <div>
            {detecting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700, background: 'var(--green-soft)', padding: '5px 12px', borderRadius: 999 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.5s ease-in-out infinite' }} />
                LIVE
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--ink-faint)', fontFamily: 'var(--font-display)', fontWeight: 700, background: 'var(--surface-2)', padding: '5px 12px', borderRadius: 999 }}>
                Idle
              </span>
            )}
          </div>

          {/* Toggles */}
          <div className="card" style={{ padding: '4px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Enable Speech</span>
              <Toggle on={speech} onClick={() => setSpeech(s => !s)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>Word Mode</span>
              <Toggle on={wordMode} onClick={() => setWordMode(m => !m)} />
            </div>
          </div>

          {/* Detected Letter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <FieldLabel>Detected Letter</FieldLabel>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 16px', minHeight: 72 }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: currentLetter ? 'var(--ink)' : 'var(--ink-faint)', lineHeight: 1, direction: 'rtl', fontFamily: currentLetter ? 'var(--font-urdu)' : 'inherit' }}>
                {currentLetter || '—'}
              </span>
            </div>
            <button className="btn btn-primary" onClick={acceptLetter} disabled={!currentLetter}
              style={{ width: '100%', height: 44, opacity: !currentLetter ? 0.45 : 1 }}>
              Accept Letter
            </button>
          </div>

          {/* Current Word */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FieldLabel>Current Word</FieldLabel>
              {currentWord && (
                <button className="btn btn-ghost btn-sm" onClick={deleteLetter}>
                  <I.ArrowLeft size={14} /> Delete
                </button>
              )}
            </div>
            <div className="card" style={{ padding: '12px 16px', minHeight: 56, direction: 'rtl', textAlign: 'right' }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: currentWord ? 'var(--ink)' : 'var(--ink-faint)', letterSpacing: '0.05em', fontFamily: currentWord ? 'var(--font-urdu)' : 'inherit' }}>
                {currentWord || '—'}
              </span>
            </div>
            <button className="btn btn-primary" onClick={addWord} disabled={!currentWord}
              style={{ width: '100%', height: 44, opacity: !currentWord ? 0.45 : 1 }}>
              Add Word to Sentence
            </button>
          </div>

          {/* Sentence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FieldLabel>Sentence</FieldLabel>
              {sentence.length > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}
                    style={{ color: copied ? 'var(--primary)' : 'var(--ink-soft)' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSentence([])}>Clear</button>
                </div>
              )}
            </div>
            <div className="card" style={{ padding: 16, minHeight: 88, direction: 'rtl', textAlign: 'right', flex: 1 }}>
              {sentence.length === 0
                ? <span style={{ color: 'var(--ink-faint)', fontSize: 14, fontFamily: 'var(--font-urdu)' }}>جملہ یہاں ظاہر ہوگا…</span>
                : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                    {sentence.map((word, i) => (
                      <span key={i} onClick={() => removeWord(i)} title="Click to remove"
                        style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', padding: '2px 8px', borderRadius: 8, transition: 'background 0.15s', fontFamily: 'var(--font-urdu)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--coral-soft)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
              }
            </div>
            <button className="btn btn-primary" onClick={() => speakSentence(sentence)} disabled={sentence.length === 0}
              style={{ width: '100%', height: 44, opacity: sentence.length === 0 ? 0.45 : 1 }}>
              <I.Volume size={18} /> Speak Sentence
            </button>
          </div>

        </div>

        {/* RIGHT: Camera feed */}
        <div className="psl-feed psl-sign-feed" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, background: 'var(--bg)', gap: 16, position: 'relative', overflow: 'hidden' }}>

          {/* Feed box */}
          <div className="psl-sign-cambox" style={{ width: '100%', maxWidth: 720, aspectRatio: '4/3', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--surface)', overflow: 'hidden', position: 'relative' }}>
            {detecting ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={`${API_BASE}/api/stream`} alt="Live feed" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--ink-faint)' }}>
                <I.Camera size={56} sw={1.2} />
                <span style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-soft)' }}>Camera inactive</span>
                <span style={{ fontSize: 13 }}>Press Start Detection to begin</span>
              </div>
            )}
          </div>

          {/* ── MOBILE OVERLAY ── */}
          <div className="psl-mob-controls" style={{
            position: 'absolute', inset: 0, zIndex: 10,
            flexDirection: 'column', pointerEvents: 'none',
          }}>
            {/* Top bar: toggle pills */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
              background: detecting ? 'linear-gradient(rgba(0,0,0,0.5), transparent)' : 'transparent',
              pointerEvents: 'auto',
            }}>
              <button onClick={() => setSpeech(s => !s)} style={{
                background: detecting ? (speech ? '#fff' : 'rgba(0,0,0,0.5)') : (speech ? 'var(--primary)' : 'var(--surface)'),
                border: detecting ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--line)',
                borderRadius: 20, padding: '6px 14px',
                color: detecting ? (speech ? '#000' : 'rgba(255,255,255,0.85)') : (speech ? 'var(--on-primary)' : 'var(--ink-soft)'),
                fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: detecting ? 'none' : 'var(--shadow-sm)',
              }}>Speech {speech ? 'ON' : 'OFF'}</button>
              <button onClick={() => setWordMode(m => !m)} style={{
                background: detecting ? (wordMode ? '#fff' : 'rgba(0,0,0,0.5)') : (wordMode ? 'var(--primary)' : 'var(--surface)'),
                border: detecting ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--line)',
                borderRadius: 20, padding: '6px 14px',
                color: detecting ? (wordMode ? '#000' : 'rgba(255,255,255,0.85)') : (wordMode ? 'var(--on-primary)' : 'var(--ink-soft)'),
                fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: detecting ? 'none' : 'var(--shadow-sm)',
              }}>Word {wordMode ? 'ON' : 'OFF'}</button>
            </div>

            <div style={{ flex: 1 }} />

            {/* Sentence chips */}
            {sentence.length > 0 && (
              <div style={{ padding: '0 14px 8px', direction: 'rtl', textAlign: 'right', pointerEvents: 'auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', marginBottom: 6 }}>
                  {sentence.map((word, i) => (
                    <span key={i} onClick={() => removeWord(i)} style={{
                      fontSize: 13, fontWeight: 600,
                      color: detecting ? '#fff' : 'var(--ink)',
                      background: detecting ? 'rgba(0,0,0,0.55)' : 'var(--surface)',
                      border: detecting ? 'none' : '1px solid var(--line)',
                      padding: '3px 10px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'var(--font-urdu)',
                    }}>{word}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => speakSentence(sentence)} style={{
                    background: detecting ? '#fff' : 'var(--primary)', border: 'none', borderRadius: 14,
                    color: detecting ? '#000' : 'var(--on-primary)',
                    fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer',
                  }}>▶ Speak</button>
                  <button onClick={copyToClipboard} style={{
                    background: detecting ? 'rgba(255,255,255,0.18)' : 'var(--surface)', border: detecting ? 'none' : '1px solid var(--line)', borderRadius: 14,
                    color: detecting ? '#fff' : 'var(--ink-soft)',
                    fontSize: 11, fontWeight: 600, padding: '5px 12px', cursor: 'pointer',
                  }}>{copied ? 'Copied!' : 'Copy'}</button>
                  <button onClick={() => setSentence([])} style={{
                    background: detecting ? 'rgba(255,255,255,0.18)' : 'var(--surface)', border: detecting ? 'none' : '1px solid var(--line)', borderRadius: 14,
                    color: detecting ? '#fff' : 'var(--ink-soft)',
                    fontSize: 11, fontWeight: 600, padding: '5px 12px', cursor: 'pointer',
                  }}>Clear</button>
                </div>
              </div>
            )}

            {/* Word bar */}
            <div style={{ padding: '0 14px 10px', pointerEvents: 'auto' }}>
              <div style={{
                background: detecting ? 'rgba(0,0,0,0.65)' : 'var(--surface)',
                border: detecting ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--line)',
                borderRadius: 14, padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: detecting ? 'none' : 'var(--shadow-sm)',
              }}>
                <div style={{ flex: 1, direction: 'rtl', textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3,
                    color: detecting ? 'rgba(255,255,255,0.4)' : 'var(--ink-faint)' }}>WORD</div>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, fontFamily: currentWord ? 'var(--font-urdu)' : 'inherit',
                    color: currentWord ? (detecting ? '#fff' : 'var(--ink)') : (detecting ? 'rgba(255,255,255,0.2)' : 'var(--ink-faint)') }}>
                    {currentWord || '—'}
                  </div>
                </div>
                {currentWord && (
                  <button onClick={deleteLetter} style={{
                    background: detecting ? 'rgba(255,255,255,0.1)' : 'var(--surface-2)',
                    border: detecting ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--line)',
                    borderRadius: 10, color: detecting ? '#fff' : 'var(--ink-soft)',
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', cursor: 'pointer', flexShrink: 0, marginLeft: 10,
                  }}>← Del</button>
                )}
              </div>
            </div>

            {/* Bottom row: LETTER | START/STOP | ACCEPT/ADD */}
            <div style={{
              background: detecting ? 'linear-gradient(transparent, rgba(0,0,0,0.75) 50%)' : 'linear-gradient(transparent, var(--bg) 60%)',
              padding: '18px 24px 32px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              pointerEvents: 'auto',
            }}>
              {/* Letter circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: detecting ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>LETTER</span>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: currentLetter ? (detecting ? '#fff' : 'var(--primary)') : (detecting ? 'rgba(255,255,255,0.08)' : 'var(--surface)'),
                  border: detecting ? '2px solid rgba(255,255,255,0.2)' : '2px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: currentLetter ? 'var(--shadow)' : 'none',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, direction: 'rtl', lineHeight: 1, fontFamily: currentLetter ? 'var(--font-urdu)' : 'inherit',
                    color: currentLetter ? (detecting ? '#000' : 'var(--on-primary)') : (detecting ? 'rgba(255,255,255,0.3)' : 'var(--ink-faint)') }}>
                    {currentLetter || '—'}
                  </span>
                </div>
              </div>

              {/* Start/Stop */}
              {!detecting ? (
                <button onClick={startDetection} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', border: '4px solid var(--green-soft)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px oklch(0.74 0.16 158/0.4)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--on-primary)', letterSpacing: '0.06em' }}>START</span>
                </button>
              ) : (
                <button onClick={handleStop} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: '#fff', border: '4px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                }}>
                  <span style={{ width: 22, height: 22, background: '#111', borderRadius: 4, display: 'block' }} />
                </button>
              )}

              {/* Accept/Add circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: detecting ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>
                  {currentWord ? 'ADD' : 'ACCEPT'}
                </span>
                <button
                  onClick={currentWord ? addWord : acceptLetter}
                  disabled={!currentLetter && !currentWord}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: (currentLetter || currentWord) ? (detecting ? '#fff' : 'var(--primary)') : (detecting ? 'rgba(255,255,255,0.08)' : 'var(--surface)'),
                    border: detecting ? '2px solid rgba(255,255,255,0.2)' : '2px solid var(--line)',
                    cursor: (currentLetter || currentWord) ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: (currentLetter || currentWord) ? 'var(--shadow)' : 'none',
                    color: (currentLetter || currentWord) ? (detecting ? '#000' : 'var(--on-primary)') : (detecting ? 'rgba(255,255,255,0.3)' : 'var(--ink-faint)'),
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{currentWord ? '＋' : '✓'}</span>
                </button>
              </div>
            </div>
          </div>
          {/* ── END MOBILE OVERLAY ── */}

          {/* Desktop start/stop button */}
          <div style={{ width: '100%', maxWidth: 720 }}>
            {!detecting ? (
              <button className="btn btn-primary" onClick={startDetection}
                style={{ width: '100%', height: 52, fontSize: 16, gap: 10 }}>
                <I.Camera size={20} /> Start Detection
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleStop}
                style={{ width: '100%', height: 52, fontSize: 16 }}>
                Stop Detection
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Mobile menu overlay — DO NOT TOUCH ── */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 50,
          display: 'flex', flexDirection: 'column', padding: '20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dot-accent" />
              <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 18, letterSpacing: '-0.02em' }}>PSL</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M6 6l10 10M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {[
            { href: '/about', label: 'About Us' },
            { href: '/contact', label: 'Contact Us' },
            { href: '/feedback', label: 'Feedback' },
            { href: '/dictionary', label: 'Dictionary' },
            { href: '/sign', label: 'Start Detection' },
            { href: '/learn', label: 'Learn Signs' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: 22, fontWeight: 600, color: 'var(--text)', textDecoration: 'none',
                padding: '16px 0', borderBottom: '1px solid var(--border-subtle)',
              }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
          </div>
        </div>
      )}

    </div>
  );
}
