"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell, TopBar } from '../components/ls/Components';
import * as I from '../components/ls/Icons';
import {
  getHistory, getStreak, getWeek, getTotalSigns,
  type HistoryEntry,
} from '../lib/history';

type WeekDay = { day: string; count: number; isToday: boolean };

function StatCard({ Icon, color, value, label }: { Icon: React.FC<I.IconProps>; color: string; value: string; label: string }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `var(--${color}-soft)`, color: `var(--${color})`, display: 'grid', placeItems: 'center' }}>
          <Icon size={23} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--ink-faint)', fontSize: 14, marginTop: 5 }}>{label}</div>
    </div>
  );
}

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
}

export default function DashboardPage() {
  const [streak, setStreak]   = useState(0);
  const [total, setTotal]     = useState(0);
  const [week, setWeek]       = useState<WeekDay[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // History lives in localStorage, only readable client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(getStreak());
    setTotal(getTotalSigns());
    setWeek(getWeek());
    setHistory(getHistory().slice(0, 8));
  }, []);

  const maxCount = Math.max(...week.map(d => d.count), 1);
  const thisWeekDays = ['M','T','W','T','F','S','S'];

  return (
    <AppShell>
      <div className="ls-page">
        <TopBar
          title="Salaam 👋"
          sub="Here's your signing journey this week"
          action={
            <Link href="/sign" className="btn btn-primary btn-sm">
              <I.Camera size={18} /> Detect
            </Link>
          }
        />

        <div style={{ padding: 'clamp(20px,3vw,34px)', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1200, width: '100%', boxSizing: 'border-box' }}>

          {/* Stats */}
          <div className="ls-stat-grid">
            <StatCard Icon={I.Flame}  color="coral" value={String(streak)}  label="Day streak" />
            <StatCard Icon={I.Hand}   color="green" value={String(total)}   label="Signs detected" />
          </div>

          <div className="ls-dash-grid">

            {/* Weekly activity */}
            <div className="card" style={{ padding: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: 20 }}>Weekly activity</h3>
                  <p style={{ color: 'var(--ink-faint)', fontSize: 13.5 }}>Signs detected per day</p>
                </div>
                <span className="chip" style={{ background: 'var(--green-soft)', color: 'var(--primary-ink)' }}>This week</span>
              </div>

              {week.every(d => d.count === 0) ? (
                <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', gap: 10 }}>
                  <I.Hand size={36} sw={1.3} />
                  <span style={{ fontSize: 14 }}>No activity yet — start detecting to see your progress</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(8px,2vw,20px)', height: 180 }}>
                  {week.map((d, k) => {
                    const pct = Math.round((d.count / maxCount) * 100);
                    return (
                      <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', maxWidth: 42, height: `${Math.max(pct, d.count > 0 ? 8 : 0)}%`, borderRadius: 12, background: d.isToday ? 'linear-gradient(var(--green),var(--green-deep))' : (d.count > 0 ? 'var(--green-soft)' : 'var(--surface-2)'), transition: 'height 0.5s var(--ease)', position: 'relative' }}>
                          {d.isToday && d.count > 0 && <span style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', color: 'var(--amber)' }}><I.Star size={18} /></span>}
                        </div>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 600 }}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Continue learning CTA */}
              <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 18, background: 'var(--bg-tint)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--green-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <I.Hand size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
                    {total === 0 ? 'Start your first session' : 'Keep practising PSL'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 2 }}>
                    {total === 0 ? '37 letters · 5 words' : `${total} signs detected so far`}
                  </div>
                </div>
                <Link href="/live-learn" className="btn btn-soft btn-sm" style={{ flexShrink: 0 }}>Practise</Link>
              </div>
            </div>

            {/* Streak card */}
            <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 20, marginBottom: 4 }}>Your streak</h3>
              <p style={{ color: 'var(--ink-faint)', fontSize: 13.5, marginBottom: 20 }}>
                {streak > 0 ? 'Keep the fire going!' : 'Detect signs daily to build a streak'}
              </p>
              <div style={{ display: 'grid', placeItems: 'center', flex: 1 }}>
                <div style={{ position: 'relative', width: 150, height: 150, display: 'grid', placeItems: 'center' }}>
                  <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--coral-soft)" strokeWidth="9" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--coral)" strokeWidth="9"
                      strokeLinecap="round" strokeDasharray="276"
                      strokeDashoffset={streak === 0 ? 276 : 276 * Math.max(0, 1 - (streak % 30) / 30)} />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--coral)', animation: streak > 0 ? 'breathe 2.5s ease-in-out infinite' : 'none' }}>
                      <I.Flame size={34} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: 1.1 }}>{streak}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>days</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                {week.map((d, k) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', background: d.count > 0 ? 'var(--coral)' : 'var(--surface-2)', color: d.count > 0 ? 'white' : 'var(--ink-faint)' }}>
                      {d.count > 0 ? <I.Check size={15} sw={3} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{d.count}</span>}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600 }}>{thisWeekDays[k]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent history */}
          <div className="card" style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 20 }}>Recent detections</h3>
              <Link href="/sign" className="btn btn-ghost btn-sm">Open detector</Link>
            </div>

            {history.length === 0 ? (
              <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--ink-faint)' }}>
                <I.Hand size={40} sw={1.3} />
                <p style={{ fontSize: 14 }}>No detections yet — use the Sign Detector to build your history</p>
                <Link href="/sign" className="btn btn-primary btn-sm"><I.Camera size={16} /> Start detecting</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((h, k) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, background: 'var(--surface-2)' }}>
                    <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 22, lineHeight: 1, paddingBottom: 4, color: 'var(--ink)', direction: 'rtl' }}>{h.text}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{relTime(h.timestamp)}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: h.kind === 'Phrase' ? 'var(--violet)' : 'var(--green)', background: h.kind === 'Phrase' ? 'var(--violet-soft)' : 'var(--green-soft)', padding: '4px 10px', borderRadius: 999 }}>{h.kind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
