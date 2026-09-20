"use client";
import { useState } from 'react';
import { LsPublicNav, LsFooter } from '../components/ls/Components';
import * as I from '../components/ls/Icons';
import { API_BASE } from '../lib/api';

const CATEGORIES = [
  { key: 'accuracy',  label: 'Detection Accuracy' },
  { key: 'speed',     label: 'Response Speed' },
  { key: 'usability', label: 'Ease of Use' },
  { key: 'overall',   label: 'Overall Experience' },
];

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius)', padding: '11px 14px', fontSize: 14, color: 'var(--ink)',
  outline: 'none', transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ padding: 2, lineHeight: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={(hover || value) >= star ? '#f59e0b' : 'none'}
            stroke={(hover || value) >= star ? '#f59e0b' : 'var(--line)'}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [likes, setLikes] = useState('');
  const [improve, setImprove] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.background = 'var(--surface)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--line)';
    e.currentTarget.style.background = 'var(--surface-2)';
  };

  return (
    <div className="ls-scope" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <LsPublicNav active="/feedback" />

      <div style={{ flex: 1, display: 'flex', gap: 'clamp(36px,5vw,72px)', padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,80px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: intro + star ratings */}
        <div style={{ flex: '0 0 300px', minWidth: 260 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Share Your Thoughts
          </span>
          <h1 style={{ fontSize: 'clamp(24px,2.8vw,38px)', margin: '14px 0 14px' }}>
            Help us <span style={{ color: 'var(--ink-faint)' }}>improve PSL</span>
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.75, marginBottom: 28 }}>
            Your feedback shapes the detection system — accuracy, speed, and usability.
          </p>
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate each area</div>
            {CATEGORIES.map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
                <StarRating value={ratings[key] ?? 0} onChange={v => setRatings(r => ({ ...r, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: text form */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 520 }}>
          {submitted ? (
            <div className="card" style={{ textAlign: 'center', padding: '56px 40px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--green-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
                <I.Check size={26} sw={2.5} />
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 10 }}>Thank You!</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 26 }}>
                Your feedback has been recorded. We appreciate you helping us improve.
              </p>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setRatings({}); setLikes(''); setImprove(''); setName(''); }}>
                Submit Another
              </button>
            </div>
          ) : (
            <form className="card" style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 18 }}
              onSubmit={async e => {
                e.preventDefault();
                setSending(true); setError('');
                try {
                  const res = await fetch(`${API_BASE}/api/feedback`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, ratings, likes, improve }),
                  });
                  if (!res.ok) throw new Error('Failed');
                  setSubmitted(true);
                } catch { setError('Something went wrong. Please try again.'); }
                finally { setSending(false); }
              }}>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                  Your Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>
                <input type="text" style={fieldStyle} placeholder="e.g. Ahmed"
                  value={name} onChange={e => setName(e.target.value)}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                  What do you like most?
                </label>
                <textarea required rows={3} style={{ ...fieldStyle, resize: 'none' }}
                  placeholder="The real-time detection is impressive…"
                  value={likes} onChange={e => setLikes(e.target.value)}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                  What could be improved?
                </label>
                <textarea required rows={3} style={{ ...fieldStyle, resize: 'none' }}
                  placeholder="It would be great if…"
                  value={improve} onChange={e => setImprove(e.target.value)}
                  onFocus={onFocus} onBlur={onBlur} />
              </div>

              {error && <p style={{ fontSize: 13, color: 'var(--coral)', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Sending…' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>

      </div>

      <LsFooter />
    </div>
  );
}
