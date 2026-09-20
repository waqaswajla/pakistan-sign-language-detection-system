/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Logo, LsThemeToggle } from '../components/ls/Components';
import * as I from '../components/ls/Icons';
import { API_BASE } from '../lib/api';

const API = `${API_BASE}/api`;

const ALL_SIGNS = [
  { target: 'ء', image: '/images/alphabet/1.png',  mode: 0 },
  { target: 'ا', image: '/images/alphabet/2.png',  mode: 0 },
  { target: 'ب', image: '/images/alphabet/3.png',  mode: 0 },
  { target: 'پ', image: '/images/alphabet/28.png', mode: 0 },
  { target: 'ت', image: '/images/alphabet/4.png',  mode: 0 },
  { target: 'ٹ', image: '/images/alphabet/27.png', mode: 0 },
  { target: 'ث', image: '/images/alphabet/5.png',  mode: 0 },
  { target: 'ج', image: '/images/alphabet/6.png',  mode: 0 },
  { target: 'چ', image: '/images/alphabet/29.png', mode: 0 },
  { target: 'ح', image: '/images/alphabet/7.png',  mode: 0 },
  { target: 'خ', image: '/images/alphabet/8.png',  mode: 0 },
  { target: 'د', image: '/images/alphabet/9.png',  mode: 0 },
  { target: 'ڈ', image: '/images/alphabet/30.png', mode: 0 },
  { target: 'ذ', image: '/images/alphabet/10.png', mode: 0 },
  { target: 'ر', image: '/images/alphabet/11.png', mode: 0 },
  { target: 'ز', image: '/images/alphabet/12.png', mode: 0 },
  { target: 'ژ', image: '/images/alphabet/31.png', mode: 0 },
  { target: 'س', image: '/images/alphabet/13.png', mode: 0 },
  { target: 'ش', image: '/images/alphabet/14.png', mode: 0 },
  { target: 'ص', image: '/images/alphabet/15.png', mode: 0 },
  { target: 'ض', image: '/images/alphabet/16.png', mode: 0 },
  { target: 'ط', image: '/images/alphabet/17.png', mode: 0 },
  { target: 'ظ', image: '/images/alphabet/18.png', mode: 0 },
  { target: 'ع', image: '/images/alphabet/19.png', mode: 0 },
  { target: 'غ', image: '/images/alphabet/20.png', mode: 0 },
  { target: 'ف', image: '/images/alphabet/21.png', mode: 0 },
  { target: 'ق', image: '/images/alphabet/22.png', mode: 0 },
  { target: 'ک', image: '/images/alphabet/32.png', mode: 0 },
  { target: 'گ', image: '/images/alphabet/33.png', mode: 0 },
  { target: 'ل', image: '/images/alphabet/23.png', mode: 0 },
  { target: 'م', image: '/images/alphabet/24.png', mode: 0 },
  { target: 'ن', image: '/images/alphabet/25.png', mode: 0 },
  { target: 'ں', image: '/images/alphabet/34.png', mode: 0 },
  { target: 'و', image: '/images/alphabet/26.png', mode: 0 },
  { target: 'ھ', image: '/images/alphabet/35.png', mode: 0 },
  { target: 'ی', image: '/images/alphabet/36.png', mode: 0 },
  { target: 'ے', image: '/images/alphabet/37.png', mode: 0 },
  { target: 'السلام علیکم', image: '/images/words/1.png', mode: 1 },
  { target: 'اللہ حافظ',    image: '/images/words/2.png', mode: 1 },
  { target: 'باپ',           image: '/images/words/3.png', mode: 1 },
  { target: 'ماں',           image: '/images/words/4.png', mode: 1 },
  { target: 'میں',           image: '/images/words/5.png', mode: 1 },
];

const QUIZ_LENGTH = 10;
function pickQuestions() {
  return [...ALL_SIGNS].sort(() => Math.random() - 0.5).slice(0, QUIZ_LENGTH);
}

type Sign = typeof ALL_SIGNS[number];
type SessionPhase = 'idle' | 'detecting' | 'correct' | 'wrong';

function QuizNav({ score, isActive }: { score: number; isActive: boolean }) {
  return (
    <nav className="psl-nav" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(12px,3vw,36px)', height: 58,
      borderBottom: '1px solid var(--line)', flexShrink: 0, gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link href="/learn" style={{
          width: 34, height: 34, borderRadius: 10, background: 'var(--surface-2)',
          border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
          color: 'var(--ink-soft)', flexShrink: 0,
        }}>
          <I.ArrowLeft size={17} />
        </Link>
        <Link href="/"><Logo size={26} /></Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, justifyContent: 'center' }}>
        {isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.5s ease-in-out infinite', flexShrink: 0 }} />}
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Live Quiz</span>
        <span className="chip" style={{ background: 'var(--violet-soft)', color: '#7850c8', fontSize: 11 }}>PSL</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
          <I.Star size={15} /> {score}
        </span>
        <LsThemeToggle />
      </div>
    </nav>
  );
}

export default function LiveQuizPage() {
  const [questions, setQuestions]   = useState<Sign[]>([]);
  const [q, setQ]                   = useState(0);
  const [session, setSession]       = useState<SessionPhase>('idle');
  const [score, setScore]           = useState(0);
  const [detected, setDetected]     = useState('');
  const [finished, setFinished]     = useState(false);
  const [timeLeft, setTimeLeft]     = useState(10);
  const [showHint, setShowHint]     = useState(false);

  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<SessionPhase>('idle');
  const qRef       = useRef(0);
  const questionsRef = useRef(questions);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { qRef.current = q; }, [q]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  useEffect(() => {
    // Shuffles with Math.random(), so it must run client-side only to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(pickQuestions());
  }, []);

  useEffect(() => () => {
    if (pollRef.current)  clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    fetch(`${API}/stop-capture`, { method: 'POST' }).catch(() => {});
  }, []);

  const stopAll = useCallback(async () => {
    if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    await fetch(`${API}/stop-capture`, { method: 'POST' }).catch(() => {});
    setSession('idle'); setDetected(''); setTimeLeft(10);
  }, []);

  function startTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!); timerRef.current = null;
          if (sessionRef.current === 'detecting') setSession('wrong');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  async function startSession() {
    setSession('detecting'); setDetected(''); setTimeLeft(10);
    await fetch(`${API}/start-capture`, { method: 'POST' }).catch(() => {});
    startTimer();
    pollRef.current = setInterval(async () => {
      if (sessionRef.current !== 'detecting') return;
      const currentQ = questionsRef.current[qRef.current];
      try {
        const res = await fetch(`${API}/match`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: currentQ.mode, speech: 0, voice_mode: 'edge' }),
        });
        const data = await res.json();
        const label: string = data.label ?? '';
        if (!label || label === 'no match' || label === 'no confidence') return;
        setDetected(label);
        if (label === currentQ.target) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setScore(s => s + 1); setSession('correct');
        }
      } catch { /* keep polling */ }
    }, 900);
  }

  function next() {
    if (q + 1 >= questions.length) {
      if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null; }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      fetch(`${API}/stop-capture`, { method: 'POST' }).catch(() => {});
      setFinished(true); return;
    }
    setQ(i => i + 1); setDetected(''); setTimeLeft(10); setShowHint(false);
    setSession('detecting'); startTimer();
  }

  async function restart() {
    await stopAll();
    setQuestions(pickQuestions());
    setQ(0); setScore(0); setDetected(''); setFinished(false); setTimeLeft(10); setShowHint(false);
  }

  if (questions.length === 0) return (
    <div className="ls-scope psl-main-fixed psl-learn-main" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <QuizNav score={0} isActive={false} />
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', fontSize: 14 }}>
        Loading quiz…
      </div>
    </div>
  );

  if (finished) return (
    <div className="ls-scope psl-main-fixed psl-learn-main" style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <QuizNav score={score} isActive={false} />
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 'clamp(16px,4vw,40px)', overflowY: 'auto' }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '⭐' : '💪'}
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 8 }}>Quiz complete!</h2>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 28 }}>You scored {score} out of {questions.length}</p>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'var(--primary)' }}>{score}/{questions.length}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Score</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'var(--green)' }}>{Math.round((score / questions.length) * 100)}%</div>
              <div style={{ fontSize: 13, color: 'var(--ink-faint)' }}>Accuracy</div>
            </div>
          </div>
          <button onClick={restart} className="btn btn-primary" style={{ width: '100%' }}>Try again</button>
        </div>
      </div>
    </div>
  );

  const question  = questions[q];
  const ringPct   = (timeLeft / 10) * 100;
  const ringColor = session === 'correct' ? 'var(--green)' : session === 'wrong' ? 'var(--coral)' : 'var(--primary)';
  const isActive  = session !== 'idle';
  const isDone    = session === 'correct' || session === 'wrong';

  return (
    <div className="ls-scope psl-main-fixed psl-learn-main" style={{
      height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column'
    }}>
      <QuizNav score={score} isActive={isActive} />

      <div className="psl-body psl-learn-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar — hidden on mobile */}
        <div className="psl-sidebar psl-learn-sidebar" style={{
          width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16,
          padding: 20, borderRight: '1px solid var(--line)', overflowY: 'auto', background: 'var(--bg)',
        }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: 22, height: 7, borderRadius: 999, transition: 'background 0.3s',
                background: i < q ? 'var(--green)' : i === q ? 'var(--primary)' : 'var(--line)',
              }} />
            ))}
          </div>

          {/* Question card */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
              Question {q + 1} of {questions.length}
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: '0 0 14px' }}>Show the sign for:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-urdu)', fontSize: question.mode === 1 ? 28 : 64, lineHeight: 1.3, direction: 'rtl' }}>
                {question.target}
              </span>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                padding: '3px 10px', borderRadius: 999, flexShrink: 0,
                background: question.mode === 0 ? 'rgba(26,107,65,0.12)' : 'rgba(120,80,200,0.12)',
                color: question.mode === 0 ? 'var(--primary)' : '#7850c8',
              }}>
                {question.mode === 0 ? 'ALPHABET' : 'WORD'}
              </span>
            </div>
            {showHint && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  border: `3px solid ${session === 'correct' ? 'var(--green)' : session === 'wrong' ? 'var(--coral)' : 'var(--line)'}`,
                  transition: 'border-color 0.3s',
                }}>
                  <img src={question.image} alt="Sign hint" onClick={() => setShowHint(false)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Make this hand sign</span>
              </div>
            )}
            {!showHint && (
              <button onClick={() => setShowHint(true)} className="btn" style={{ fontSize: 12, height: 34, background: 'var(--surface-2)', fontWeight: 700 }}>
                Hint
              </button>
            )}
          </div>

          {/* Timer */}
          <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
              <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="var(--line)" strokeWidth="4" />
                <circle cx="26" cy="26" r="22" fill="none" stroke={ringColor} strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  strokeDashoffset={`${2 * Math.PI * 22 * (1 - ringPct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                {session === 'detecting' ? timeLeft : '—'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {session === 'idle'      ? 'Press Start to begin'  :
                 session === 'detecting' ? `${timeLeft}s remaining` :
                 session === 'correct'   ? '✓ Correct!'            : '✗ Time up'}
              </div>
              {detected && session === 'detecting' && (
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3 }}>
                  Seeing: <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 18 }}>{detected}</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          {isDone && (
            <button onClick={next} className="btn btn-primary" style={{ height: 48, fontSize: 15 }}>
              {q + 1 >= questions.length ? 'See results →' : 'Next question →'}
            </button>
          )}
          {isActive && (
            <button onClick={stopAll} className="btn" style={{ height: 40, background: 'var(--surface-2)', fontSize: 14, fontWeight: 700 }}>
              Stop camera
            </button>
          )}
        </div>

        {/* Camera feed */}
        <div className="psl-feed psl-learn-feed" style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 28, background: 'var(--bg)', gap: 16, position: 'relative', overflow: 'hidden',
        }}>
          {/* Camera box */}
          <div className="psl-learn-cambox" style={{
            width: '100%', maxWidth: 720, aspectRatio: '4/3', borderRadius: 20,
            border: '1px solid var(--line)', background: 'var(--surface)', overflow: 'hidden', position: 'relative',
          }}>
            {isActive ? (
              <img src={`${API}/stream`} alt="Live feed" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--ink-faint)' }}>
                <I.Camera size={56} sw={1.2} />
                <span style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-soft)' }}>Camera inactive</span>
                <span style={{ fontSize: 13 }}>Press Start to begin</span>
              </div>
            )}
            {isActive && (
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', borderRadius: 999, padding: '4px 12px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: session === 'correct' ? '#22c55e' : 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>LIVE</span>
              </div>
            )}
            {session === 'correct' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,200,100,0.18)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 80, color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>✓</div>
              </div>
            )}
            {session === 'wrong' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(220,60,60,0.2)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 52 }}>✗</div>
                  <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                    Correct: <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 22 }}>{question.target}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile overlay ── */}
          <div className="psl-mob-controls" style={{ position: 'absolute', inset: 0, zIndex: 10, flexDirection: 'column', pointerEvents: 'none' }}>

            {/* Top: step dots + score */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px',
              background: isActive ? 'linear-gradient(rgba(0,0,0,0.55), transparent)' : 'transparent',
              pointerEvents: 'auto',
            }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                {questions.map((_, i) => (
                  <div key={i} style={{
                    width: 18, height: 5, borderRadius: 999, transition: 'background 0.3s',
                    background: i < q ? (isActive ? '#22c55e' : 'var(--green)') : i === q ? (isActive ? '#fff' : 'var(--primary)') : isActive ? 'rgba(255,255,255,0.25)' : 'var(--line)',
                  }} />
                ))}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : 'var(--ink)', marginLeft: 10, flexShrink: 0 }}>
                <I.Star size={13} /> {score}
              </span>
            </div>

            {/* Middle: question info */}
            <div style={{ padding: '0 14px 0', pointerEvents: 'auto' }}>
              <div style={{
                borderRadius: 16,
                background: isActive ? 'rgba(0,0,0,0.45)' : 'var(--surface)',
                border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid var(--line)',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.45)' : 'var(--primary)', marginBottom: 6 }}>
                  Q{q + 1}/{questions.length} · {question.mode === 0 ? 'Alphabet' : 'Word'}
                </div>
                <div style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--ink-soft)', marginBottom: 6 }}>
                  Show the sign for:
                </div>
                <div style={{ fontFamily: 'var(--font-urdu)', fontSize: question.mode === 1 ? 28 : 52, lineHeight: 1.3, direction: 'rtl', color: isActive ? '#fff' : 'var(--ink)', textAlign: 'right' }}>
                  {question.target}
                </div>
                {showHint && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                      <img src={question.image} alt="hint" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--ink-faint)' }}>Make this hand sign</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Bottom: timer | ⬤ action | hint */}
            <div style={{
              background: isActive ? 'linear-gradient(transparent, rgba(0,0,0,0.75) 50%)' : 'linear-gradient(transparent, var(--bg) 60%)',
              padding: '18px 24px 32px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              pointerEvents: 'auto',
            }}>
              {/* Timer circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>TIME</span>
                <div style={{ position: 'relative', width: 52, height: 52 }}>
                  <svg width="52" height="52" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                    <circle cx="26" cy="26" r="21" fill={isActive ? 'rgba(255,255,255,0.08)' : 'var(--surface)'} stroke={isActive ? 'rgba(255,255,255,0.15)' : 'var(--line)'} strokeWidth="3" />
                    <circle cx="26" cy="26" r="21" fill="none"
                      stroke={session === 'correct' ? '#22c55e' : session === 'wrong' ? '#f87171' : isActive ? 'rgba(255,255,255,0.85)' : 'var(--primary)'}
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 21}`}
                      strokeDashoffset={`${2 * Math.PI * 21 * (1 - ringPct / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: isActive ? '#fff' : 'var(--ink)' }}>
                    {session === 'detecting' ? timeLeft : '—'}
                  </div>
                </div>
              </div>

              {/* Big action button */}
              {!isActive && (
                <button onClick={startSession} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', border: '4px solid var(--green-soft)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px oklch(0.74 0.16 158/0.4)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.06em' }}>START</span>
                </button>
              )}
              {session === 'detecting' && (
                <button onClick={stopAll} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: '#fff', border: '4px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                }}>
                  <span style={{ width: 22, height: 22, background: '#111', borderRadius: 4, display: 'block' }} />
                </button>
              )}
              {isDone && (
                <button onClick={next} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: session === 'correct' ? '#22c55e' : '#f87171',
                  border: '4px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                }}>
                  <I.ArrowRight size={22} />
                  <span style={{ fontSize: 8, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>NEXT</span>
                </button>
              )}

              {/* Hint circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>HINT</span>
                <button onClick={() => setShowHint(v => !v)} style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: showHint ? (isActive ? 'rgba(255,255,255,0.25)' : 'var(--primary)') : (isActive ? 'rgba(255,255,255,0.1)' : 'var(--surface)'),
                  border: isActive ? '2px solid rgba(255,255,255,0.2)' : '2px solid var(--line)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : 'var(--ink-soft)',
                }}>
                  <I.Eye size={20} />
                </button>
              </div>
            </div>
          </div>
          {/* ── End mobile overlay ── */}

          {/* Desktop controls (hidden on mobile: psl-learn-feed > div:last-child) */}
          <div style={{ width: '100%', maxWidth: 720, display: 'flex', gap: 8 }}>
            {!isActive && (
              <button onClick={startSession} className="btn btn-primary" style={{ flex: 1, height: 52, fontSize: 16 }}>
                <I.Camera size={20} /> Start Quiz
              </button>
            )}
            {isDone && (
              <button onClick={next} className="btn btn-primary" style={{ flex: 1, height: 52, fontSize: 16 }}>
                {q + 1 >= questions.length ? 'See results →' : 'Next question →'}
              </button>
            )}
            {isActive && !isDone && (
              <button onClick={stopAll} className="btn" style={{ flex: 1, height: 52, background: 'var(--surface-2)', fontWeight: 700 }}>
                Stop camera
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
