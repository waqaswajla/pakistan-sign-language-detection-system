/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Logo, LsThemeToggle } from '../components/ls/Components';
import * as I from '../components/ls/Icons';
import { API_BASE } from '../lib/api';

const API = `${API_BASE}/api`;

const ALPHABETS = [
  { label: 'ء', roman: 'Hamza',       image: '/images/alphabet/1.png'  },
  { label: 'ا', roman: 'Alif',        image: '/images/alphabet/2.png'  },
  { label: 'ب', roman: 'Bay',         image: '/images/alphabet/3.png'  },
  { label: 'پ', roman: 'Pay',         image: '/images/alphabet/28.png' },
  { label: 'ت', roman: 'Tay',         image: '/images/alphabet/4.png'  },
  { label: 'ٹ', roman: 'Ttay',        image: '/images/alphabet/27.png' },
  { label: 'ث', roman: 'Thay',        image: '/images/alphabet/5.png'  },
  { label: 'ج', roman: 'Jeem',        image: '/images/alphabet/6.png'  },
  { label: 'چ', roman: 'Chay',        image: '/images/alphabet/29.png' },
  { label: 'ح', roman: 'Hay',         image: '/images/alphabet/7.png'  },
  { label: 'خ', roman: 'Khay',        image: '/images/alphabet/8.png'  },
  { label: 'د', roman: 'Daal',        image: '/images/alphabet/9.png'  },
  { label: 'ڈ', roman: 'Dday',        image: '/images/alphabet/30.png' },
  { label: 'ذ', roman: 'Dhaal',       image: '/images/alphabet/10.png' },
  { label: 'ر', roman: 'Ray',         image: '/images/alphabet/11.png' },
  { label: 'ز', roman: 'Zay',         image: '/images/alphabet/12.png' },
  { label: 'ژ', roman: 'Zhay',        image: '/images/alphabet/31.png' },
  { label: 'س', roman: 'Seen',        image: '/images/alphabet/13.png' },
  { label: 'ش', roman: 'Sheen',       image: '/images/alphabet/14.png' },
  { label: 'ص', roman: 'Suaad',       image: '/images/alphabet/15.png' },
  { label: 'ض', roman: 'Duaad',       image: '/images/alphabet/16.png' },
  { label: 'ط', roman: 'Toy',         image: '/images/alphabet/17.png' },
  { label: 'ظ', roman: 'Zoy',         image: '/images/alphabet/18.png' },
  { label: 'ع', roman: 'Ain',         image: '/images/alphabet/19.png' },
  { label: 'غ', roman: 'Ghain',       image: '/images/alphabet/20.png' },
  { label: 'ف', roman: 'Fay',         image: '/images/alphabet/21.png' },
  { label: 'ق', roman: 'Qaaf',        image: '/images/alphabet/22.png' },
  { label: 'ک', roman: 'Kaaf',        image: '/images/alphabet/32.png' },
  { label: 'گ', roman: 'Gaaf',        image: '/images/alphabet/33.png' },
  { label: 'ل', roman: 'Laam',        image: '/images/alphabet/23.png' },
  { label: 'م', roman: 'Meem',        image: '/images/alphabet/24.png' },
  { label: 'ن', roman: 'Noon',        image: '/images/alphabet/25.png' },
  { label: 'ں', roman: 'Noon Ghunna', image: '/images/alphabet/34.png' },
  { label: 'و', roman: 'Wao',         image: '/images/alphabet/26.png' },
  { label: 'ھ', roman: 'Dho Chashmi', image: '/images/alphabet/35.png' },
  { label: 'ی', roman: 'Yay',         image: '/images/alphabet/36.png' },
  { label: 'ے', roman: 'Barray Yay',  image: '/images/alphabet/37.png' },
];

const WORDS = [
  { label: 'السلام علیکم', roman: 'As-salaam Alaikum', image: '/images/words/1.png' },
  { label: 'اللہ حافظ',    roman: 'Allah Hafiz',        image: '/images/words/2.png' },
  { label: 'باپ',           roman: 'Baap',               image: '/images/words/3.png' },
  { label: 'ماں',           roman: 'Maan',               image: '/images/words/4.png' },
  { label: 'میں',           roman: 'Mein',               image: '/images/words/5.png' },
];

type Mode  = 'alphabets' | 'words';
type Phase = 'idle' | 'detecting' | 'correct';

export default function LiveLearnPage() {
  const [mode, setMode]         = useState<Mode>('alphabets');
  const [idx, setIdx]           = useState(0);
  const [phase, setPhase]       = useState<Phase>('idle');
  const [streak, setStreak]     = useState(0);
  const [done, setDone]         = useState<number[]>([]);
  const [detected, setDetected] = useState('');

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const idxRef   = useRef(0);
  const modeRef  = useRef<Mode>('alphabets');
  const phaseRef = useRef<Phase>('idle');
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const SIGNS    = mode === 'alphabets' ? ALPHABETS : WORDS;
  const sign     = SIGNS[idx] ?? SIGNS[0];
  const progress = (done.length / SIGNS.length) * 100;

  const borderColor =
    phase === 'correct'   ? 'var(--green)'   :
    phase === 'detecting' ? 'var(--primary)'  : 'var(--line)';

  useEffect(() => () => {
    if (pollRef.current)  clearInterval(pollRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
    fetch(`${API}/stop-capture`, { method: 'POST' }).catch(() => {});
  }, []);

  const stopAll = useCallback(async () => {
    if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null; }
    if (flashRef.current) { clearTimeout(flashRef.current);  flashRef.current = null; }
    await fetch(`${API}/stop-capture`, { method: 'POST' }).catch(() => {});
    setPhase('idle');
    setDetected('');
  }, []);

  async function switchMode(m: Mode) {
    await stopAll();
    setMode(m); setIdx(0); setDone([]); setStreak(0);
  }

  function advanceSign() {
    if (flashRef.current) { clearTimeout(flashRef.current); flashRef.current = null; }
    const signs = modeRef.current === 'alphabets' ? ALPHABETS : WORDS;
    setIdx(i => (i + 1) % signs.length);
    setDetected('');
    setPhase('detecting');
  }

  async function startSession() {
    setPhase('detecting');
    setDetected('');
    await fetch(`${API}/start-capture`, { method: 'POST' }).catch(() => {});
    pollRef.current = setInterval(async () => {
      if (phaseRef.current !== 'detecting') return;
      try {
        const apiMode = modeRef.current === 'words' ? 1 : 0;
        const res = await fetch(`${API}/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: apiMode, speech: 0, voice_mode: 'edge' }),
        });
        const data = await res.json();
        const label: string = data.label ?? '';
        if (!label || label === 'no match' || label === 'no confidence') return;
        setDetected(label);
        const signs = modeRef.current === 'alphabets' ? ALPHABETS : WORDS;
        if (label === signs[idxRef.current].label) {
          setPhase('correct');
          setStreak(s => s + 1);
          setDone(d => d.includes(idxRef.current) ? d : [...d, idxRef.current]);
          flashRef.current = setTimeout(advanceSign, 1300);
        }
      } catch { /* keep polling */ }
    }, 900);
  }

  function skip() {
    if (phaseRef.current === 'idle') return;
    if (flashRef.current) { clearTimeout(flashRef.current); flashRef.current = null; }
    setStreak(0);
    const signs = modeRef.current === 'alphabets' ? ALPHABETS : WORDS;
    setIdx(i => (i + 1) % signs.length);
    setDetected('');
    setPhase('detecting');
  }

  const isActive = phase !== 'idle';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="ls-scope psl-main-fixed psl-learn-main" style={{
      height: '100vh', overflow: 'hidden', background: 'var(--bg)', display: 'flex', flexDirection: 'column'
    }}>

      {/* Nav */}
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
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            width: 34, height: 34, borderRadius: 10, background: sidebarOpen ? 'var(--green-soft)' : 'var(--surface-2)',
            border: `1px solid ${sidebarOpen ? 'var(--primary)' : 'var(--line)'}`,
            display: 'grid', placeItems: 'center', color: sidebarOpen ? 'var(--primary)' : 'var(--ink-soft)',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          <Link href="/"><Logo size={26} /></Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, justifyContent: 'center' }}>
          {isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.5s ease-in-out infinite', flexShrink: 0 }} />}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Live Learn</span>
          <span className="chip" style={{ background: 'var(--green-soft)', color: 'var(--primary)', fontSize: 11 }}>PSL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LsThemeToggle />
        </div>
      </nav>

      {/* Body */}
      <div className="psl-body psl-learn-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar — hidden on mobile */}
        <div className="psl-sidebar psl-learn-sidebar" style={{
          width: sidebarOpen ? 340 : 0, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: sidebarOpen ? '1px solid var(--line)' : 'none',
          overflow: 'hidden', background: 'var(--bg)',
          transition: 'width 0.25s var(--ease)',
        }}>

          {/* Fixed top section */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 20px' }}>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['alphabets', 'words'] as Mode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  padding: '8px 22px', borderRadius: 999, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  border: '2px solid', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: mode === m ? 'var(--primary)' : 'var(--line)',
                  background:  mode === m ? 'var(--green-soft)' : 'var(--surface-2)',
                  color:       mode === m ? 'var(--primary)' : 'var(--ink-soft)',
                }}>
                  {m === 'alphabets' ? 'Alphabets' : 'Words'}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.5s var(--ease)' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                {done.length}/{SIGNS.length}
              </span>
              {streak > 1 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--amber)', padding: '3px 10px', background: 'oklch(0.97 0.04 80)', borderRadius: 999 }}>
                  <I.Flame size={14} /> {streak}
                </span>
              )}
            </div>

            {/* Sign image — full natural size */}
            <div style={{ borderRadius: 14, border: `3px solid ${borderColor}`, overflow: 'hidden', position: 'relative', transition: 'border-color 0.3s' }}>
              <img src={sign.image} alt={sign.roman} style={{ width: '100%', height: 'auto', display: 'block' }} />
              {phase === 'correct' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,200,100,0.35)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: 72, color: 'white', textShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>✓</span>
                </div>
              )}
            </div>

            {/* Label + urdu letter */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.09em', textTransform: 'uppercase', textAlign: 'center' }}>
              {mode === 'alphabets' ? 'Sign this letter' : 'Sign this word'}
            </div>
            <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 40, lineHeight: 1.3, color: 'var(--ink)', direction: 'rtl', textAlign: 'center' }}>
              {sign.label}
            </div>
            {detected && phase === 'detecting' && (
              <div style={{ textAlign: 'center', padding: '4px 14px', borderRadius: 999, background: 'var(--surface-2)', fontSize: 13, color: 'var(--ink-soft)' }}>
                Seeing: <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 18, direction: 'rtl' }}>{detected}</span>
              </div>
            )}

            {/* Controls */}
            {phase !== 'idle' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={stopAll} className="btn" style={{ flex: 1, background: 'var(--surface-2)', fontWeight: 700 }}>Stop</button>
                <button onClick={skip} disabled={phase === 'correct'} className="btn" style={{ background: 'var(--surface-2)' }}>Skip</button>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 4 }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {mode === 'alphabets' ? 'All 37 letters' : 'All words'}
            </div>
          </div>

          {/* Scrollable letters grid only */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, direction: 'rtl' }}>
              {SIGNS.map((s, i) => (
                <button key={s.label} onClick={() => {
                  if (phase === 'idle') return;
                  if (flashRef.current) { clearTimeout(flashRef.current); flashRef.current = null; }
                  setIdx(i); setDetected(''); setPhase('detecting');
                }} style={{
                  minWidth: mode === 'words' ? 'auto' : 44,
                  height: 44,
                  padding: mode === 'words' ? '0 14px' : '0',
                  width: mode === 'words' ? 'auto' : 44,
                  borderRadius: 10, border: '1.5px solid',
                  borderColor: i === idx && phase !== 'idle' ? 'var(--primary)' : done.includes(i) ? 'var(--green)' : 'var(--line)',
                  background:  i === idx && phase !== 'idle' ? 'var(--green-soft)' : done.includes(i) ? 'oklch(0.97 0.04 158)' : 'var(--surface-2)',
                  fontFamily: 'var(--font-urdu)', fontWeight: 700, fontSize: mode === 'words' ? 15 : 20,
                  color: i === idx && phase !== 'idle' ? 'var(--primary)' : done.includes(i) ? 'var(--green-deep)' : 'var(--ink)',
                  cursor: phase === 'idle' ? 'default' : 'pointer',
                  transition: 'all 0.2s', opacity: phase === 'idle' ? 0.5 : 1, direction: 'rtl',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'nodePulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, color: 'white', fontWeight: 700 }}>LIVE</span>
              </div>
            )}
            {phase === 'correct' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,200,100,0.2)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 80, color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>✓</div>
              </div>
            )}
          </div>

          {/* ── Mobile overlay ── */}
          <div className="psl-mob-controls" style={{ position: 'absolute', inset: 0, zIndex: 10, flexDirection: 'column', pointerEvents: 'none' }}>

            {/* Top: mode pills */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
              background: isActive ? 'linear-gradient(rgba(0,0,0,0.5), transparent)' : 'transparent',
              pointerEvents: 'auto',
            }}>
              {(['alphabets', 'words'] as Mode[]).map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  background: isActive ? (mode === m ? '#fff' : 'rgba(0,0,0,0.5)') : (mode === m ? 'var(--primary)' : 'var(--surface)'),
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--line)',
                  borderRadius: 20, padding: '6px 14px',
                  color: isActive ? (mode === m ? '#000' : 'rgba(255,255,255,0.85)') : (mode === m ? 'white' : 'var(--ink-soft)'),
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  {m === 'alphabets' ? 'Alphabets' : 'Words'}
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ padding: '0 12px 6px', pointerEvents: 'auto' }}>
              <div style={{ height: 4, borderRadius: 999, background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--surface-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--ink-faint)', marginTop: 3, textAlign: 'right' }}>
                {done.length}/{SIGNS.length}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Bottom: LETTER | ⬤ START/STOP | SKIP */}
            <div style={{
              background: isActive ? 'linear-gradient(transparent, rgba(0,0,0,0.75) 50%)' : 'linear-gradient(transparent, var(--bg) 60%)',
              padding: '18px 24px 32px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              pointerEvents: 'auto',
            }}>
              {/* Letter circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>
                  {mode === 'alphabets' ? 'LETTER' : 'WORD'}
                </span>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'var(--surface)',
                  border: isActive ? '2px solid rgba(255,255,255,0.25)' : '2px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 20, fontWeight: 700, direction: 'rtl', lineHeight: 1, color: isActive ? '#fff' : 'var(--ink)' }}>
                    {sign.label.length > 2 ? sign.label[0] : sign.label}
                  </span>
                </div>
              </div>

              {/* Start / Stop big circle */}
              {!isActive ? (
                <button onClick={startSession} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', border: '4px solid var(--green-soft)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px oklch(0.74 0.16 158/0.4)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.06em' }}>START</span>
                </button>
              ) : (
                <button onClick={stopAll} style={{
                  width: 76, height: 76, borderRadius: '50%', flexShrink: 0,
                  background: '#fff', border: '4px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                }}>
                  <span style={{ width: 22, height: 22, background: '#111', borderRadius: 4, display: 'block' }} />
                </button>
              )}

              {/* Skip circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.45)' : 'var(--ink-faint)' }}>
                  SKIP
                </span>
                <button onClick={skip} disabled={!isActive || phase === 'correct'} style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'var(--surface)',
                  border: isActive ? '2px solid rgba(255,255,255,0.2)' : '2px solid var(--line)',
                  cursor: isActive && phase !== 'correct' ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : 'var(--ink-faint)',
                  opacity: !isActive ? 0.4 : 1,
                }}>
                  <I.ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
          {/* ── End mobile overlay ── */}

          {/* Desktop controls (hidden on mobile via CSS: psl-learn-feed > div:last-child) */}
          <div style={{ width: '100%', maxWidth: 720, display: 'flex', gap: 8 }}>
            {phase === 'idle' ? (
              <button onClick={startSession} className="btn btn-primary" style={{ flex: 1, height: 52, fontSize: 16, gap: 10 }}>
                <I.Camera size={20} /> Start Learning
              </button>
            ) : (
              <>
                <button onClick={stopAll} className="btn" style={{ flex: 1, height: 52, background: 'var(--surface-2)', fontWeight: 700 }}>Stop</button>
                <button onClick={skip} disabled={phase === 'correct'} className="btn" style={{ height: 52, background: 'var(--surface-2)' }}>Skip</button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
