"use client";
import { useState } from 'react';
import { LsPublicNav, LsFooter } from '../components/ls/Components';
import * as I from '../components/ls/Icons';

const INFO = [
  {
    label: 'Email', value: 'wow.992du@gmail.com', color: 'green',
    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  },
  {
    label: 'Phone', value: '+92 300 0700908', color: 'coral',
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
  },
  {
    label: 'Location', value: 'Pakistan', color: 'sky',
    icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  },
  {
    label: 'GitHub', value: 'PSL Recognition Project', color: 'violet',
    icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>,
  },
];

const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-2)', border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius)', padding: '13px 16px', fontSize: 15, color: 'var(--ink)',
  outline: 'none', transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="ls-scope ls-pub-page">
      <LsPublicNav active="/contact" />

      <div style={{ flex: 1, display: 'flex', gap: 'clamp(40px,6vw,100px)', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,96px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Info panel */}
        <div style={{ flex: '0 0 340px', minWidth: 260 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: 'clamp(26px,3vw,44px)', margin: '16px 0 18px' }}>
            We&apos;d love to{' '}
            <span style={{ color: 'var(--ink-faint)' }}>hear from you</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.8, marginBottom: 40 }}>
            Have questions about the project, feedback on the detection system, or want to collaborate? Send us a message.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {INFO.map(({ label, value, color, icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: `var(--${color}-soft)`, color: `var(--${color})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, minWidth: 280, maxWidth: 540 }}>
          {sent ? (
            <div className="card" style={{ textAlign: 'center', padding: '64px 40px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--green-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <I.Check size={26} sw={2.5} />
              </div>
              <h2 style={{ fontSize: 22, marginBottom: 10 }}>Message Sent!</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28 }}>Thanks for reaching out. We&apos;ll get back to you soon.</p>
              <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                Send Another
              </button>
            </div>
          ) : (
            <form className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
              onSubmit={async e => {
                e.preventDefault();
                setSending(true); setError('');
                try {
                  const res = await fetch('http://localhost:8000/api/contact', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                  });
                  if (!res.ok) throw new Error('Failed');
                  setSent(true);
                } catch { setError('Something went wrong. Please try again.'); }
                finally { setSending(false); }
              }}>
              {(['name', 'email', 'message'] as const).map(field => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === 'message' ? (
                    <textarea required rows={5} style={{ ...fieldStyle, resize: 'vertical' }}
                      placeholder="Your message…" value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                    />
                  ) : (
                    <input required type={field === 'email' ? 'email' : 'text'} style={fieldStyle}
                      placeholder={field === 'email' ? 'your@email.com' : 'Your name'}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                    />
                  )}
                </div>
              ))}
              {error && <p style={{ fontSize: 13, color: 'var(--coral)', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>

      <LsFooter />
    </div>
  );
}
