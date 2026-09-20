"use client";
import { useState } from 'react';
import Image from 'next/image';
import { LsPublicNav, LsFooter } from '../components/ls/Components';

function SearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: 'var(--surface-2)', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', padding: '8px 32px 8px 32px', fontSize: 14.5, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit', width: 220, transition: 'border-color 0.2s' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--line)')}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 2, lineHeight: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}

/* Labels sorted by Unicode code point — matches sklearn LabelEncoder order and image filenames */
const ALPHA_DATA = [
  { c:'ء', n:'Hamza',       u:'ہمزہ',      index:1  },
  { c:'ا', n:'Alif',        u:'الف',        index:2  },
  { c:'ب', n:'Be',          u:'بے',         index:3  },
  { c:'ت', n:'Te',          u:'تے',         index:4  },
  { c:'ث', n:'Se',          u:'ثے',         index:5  },
  { c:'ج', n:'Jeem',        u:'جیم',        index:6  },
  { c:'ح', n:'Baṛī He',     u:'بڑی حے',    index:7  },
  { c:'خ', n:'Khe',         u:'خے',         index:8  },
  { c:'د', n:'Dal',         u:'دال',        index:9  },
  { c:'ذ', n:'Zal',         u:'ذال',        index:10 },
  { c:'ر', n:'Re',          u:'رے',         index:11 },
  { c:'ز', n:'Ze',          u:'زے',         index:12 },
  { c:'س', n:'Seen',        u:'سین',        index:13 },
  { c:'ش', n:'Sheen',       u:'شین',        index:14 },
  { c:'ص', n:'Suad',        u:'صواد',       index:15 },
  { c:'ض', n:'Zuad',        u:'ضواد',       index:16 },
  { c:'ط', n:'Toe',         u:'طوے',        index:17 },
  { c:'ظ', n:'Zoe',         u:'ظوے',        index:18 },
  { c:'ع', n:'Ain',         u:'عین',        index:19 },
  { c:'غ', n:'Ghain',       u:'غین',        index:20 },
  { c:'ف', n:'Fe',          u:'فے',         index:21 },
  { c:'ق', n:'Qaf',         u:'قاف',        index:22 },
  { c:'ل', n:'Lam',         u:'لام',        index:23 },
  { c:'م', n:'Meem',        u:'میم',        index:24 },
  { c:'ن', n:'Noon',        u:'نون',        index:25 },
  { c:'و', n:'Wao',         u:'واؤ',        index:26 },
  { c:'ٹ', n:'Ṭe',          u:'ٹے',         index:27 },
  { c:'پ', n:'Pe',          u:'پے',         index:28 },
  { c:'چ', n:'Che',         u:'چے',         index:29 },
  { c:'ڈ', n:'Ḍal',         u:'ڈال',        index:30 },
  { c:'ژ', n:'Zhe',         u:'ژے',         index:31 },
  { c:'ک', n:'Kaf',         u:'کاف',        index:32 },
  { c:'گ', n:'Gaf',         u:'گاف',        index:33 },
  { c:'ں', n:'Noon Ghunna', u:'نون غنہ',   index:34 },
  { c:'ھ', n:'Choṭī He',    u:'چھوٹی ہے',  index:35 },
  { c:'ی', n:'Ye',          u:'یے',         index:36 },
  { c:'ے', n:'Baṛī Ye',    u:'بڑی یے',   index:37 },
];

/* Words sorted by Unicode code point — matches image filenames 1–5 */
const WORDS_DATA = [
  { urdu:'السلام علیکم', english:'Hello / Peace',  index:1 },
  { urdu:'اللہ حافظ',    english:'Goodbye',         index:2 },
  { urdu:'باپ',           english:'Father',           index:3 },
  { urdu:'ماں',           english:'Mother',           index:4 },
  { urdu:'میں',           english:'I / Me',           index:5 },
];

type CategoryId = 'alphabet' | 'words';
type View = 'home' | CategoryId;

interface Category { id: CategoryId; title: string; subtitle: string; count: number; ready: boolean; icon: React.ReactNode; color: string; }

const CATEGORIES: Category[] = [
  {
    id: 'alphabet', title: 'Urdu Alphabet', subtitle: '37 letters', count: 37, ready: true, color: 'green',
    icon: <span style={{ fontSize: 44, fontWeight: 800, color: 'var(--primary)', direction: 'rtl', lineHeight: 1 }}>ا</span>,
  },
  {
    id: 'words', title: 'Words', subtitle: '5 signs', count: 5, ready: true, color: 'violet',
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="var(--violet)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 8h32a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H16l-8 8V10a2 2 0 0 1 2-2z"/>
        <line x1="16" y1="20" x2="32" y2="20"/><line x1="16" y1="28" x2="24" y2="28"/>
      </svg>
    ),
  },
];

type AlphaItem = typeof ALPHA_DATA[number];
type WordItem  = typeof WORDS_DATA[number];

function BackCrumb({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--ink-soft)', fontFamily: 'var(--font-display)', fontWeight: 600, transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink-soft)'}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Dictionary
      </button>
      <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>/</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
    </div>
  );
}

const cardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = enter ? 'var(--primary)' : 'var(--line)';
  el.style.transform   = enter ? 'translateY(-3px)' : 'none';
  el.style.boxShadow   = enter ? 'var(--shadow)' : 'var(--shadow-sm)';
};

export default function DictionaryPage() {
  const [view, setView]               = useState<View>('home');
  const [query, setQuery]             = useState('');
  const [selectedAlpha, setSelectedAlpha] = useState<AlphaItem | null>(null);
  const [selectedWord, setSelectedWord]   = useState<WordItem  | null>(null);

  const q = query.trim().toLowerCase();

  const filteredAlpha = q
    ? ALPHA_DATA.filter(a =>
        a.c.includes(query.trim()) ||
        a.n.toLowerCase().includes(q) ||
        a.u.includes(query.trim()))
    : ALPHA_DATA;

  const filteredWords = q
    ? WORDS_DATA.filter(w =>
        w.urdu.includes(query.trim()) ||
        w.english.toLowerCase().includes(q))
    : WORDS_DATA;

  function goHome() { setView('home'); setQuery(''); setSelectedAlpha(null); setSelectedWord(null); }

  return (
    <div className="ls-scope" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <LsPublicNav active="/dictionary" />

      {/* ── HOME ── */}
      {view === 'home' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '32px clamp(20px,4vw,52px)' }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 'clamp(20px,2.4vw,32px)', margin: 0 }}>PSL Dictionary</h1>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6 }}>Explore Pakistan Sign Language — alphabet and word categories</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {CATEGORIES.map(cat => (
                <div key={cat.id} onClick={() => cat.ready && setView(cat.id)}
                  className="card"
                  style={{ padding: '26px 18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, cursor: cat.ready ? 'pointer' : 'default', opacity: cat.ready ? 1 : 0.48, transition: 'all 0.2s', position: 'relative' }}
                  onMouseEnter={e => { if (cat.ready) cardHover(e, true); }}
                  onMouseLeave={e => { if (cat.ready) cardHover(e, false); }}
                >
                  {!cat.ready && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: 'var(--ink-faint)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Soon</span>
                  )}
                  <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.icon}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14.5, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{cat.title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{cat.ready ? `${cat.count} signs` : cat.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <LsFooter />
        </div>
      )}

      {/* ── ALPHABET ── */}
      {view === 'alphabet' && (
        <>
          <div style={{ padding: '18px clamp(20px,4vw,52px) 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <BackCrumb label="Urdu Alphabet" onBack={goHome} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{filteredAlpha.length} of {ALPHA_DATA.length}</span>
                <SearchInput placeholder="Search ب or Jeem…" value={query} onChange={setQuery} />
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px clamp(20px,4vw,52px) 24px' }}>
            {filteredAlpha.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--ink-faint)', gap: 8 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 14 }}>No sign found for &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(138px, 1fr))', gap: 14 }}>
                {filteredAlpha.map(item => (
                  <div key={item.index} onClick={() => setSelectedAlpha(item)}
                    className="card"
                    style={{ padding: '14px 10px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => cardHover(e, true)}
                    onMouseLeave={e => cardHover(e, false)}
                  >
                    <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink)', direction: 'rtl', lineHeight: 1 }}>{item.c}</span>
                    <Image src={`/images/alphabet/${item.index}.png`} alt={`Sign for ${item.c}`} width={88} height={88} style={{ objectFit: 'contain' }} unoptimized />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-nastaliq)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, direction: 'rtl' }}>{item.u}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{item.n}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── WORDS ── */}
      {view === 'words' && (
        <>
          <div style={{ padding: '18px clamp(20px,4vw,52px) 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <BackCrumb label="Words" onBack={goHome} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{filteredWords.length} of {WORDS_DATA.length}</span>
                <SearchInput placeholder="Search word…" value={query} onChange={setQuery} />
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px clamp(20px,4vw,52px) 24px' }}>
            {filteredWords.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--ink-faint)', gap: 8 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span style={{ fontSize: 14 }}>No word found for &ldquo;{query}&rdquo;</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 14 }}>
                {filteredWords.map(word => (
                  <div key={word.index} onClick={() => setSelectedWord(word)}
                    className="card"
                    style={{ padding: '14px 10px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => cardHover(e, true)}
                    onMouseLeave={e => cardHover(e, false)}
                  >
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', direction: 'rtl', lineHeight: 1.3, textAlign: 'center', fontFamily: 'var(--font-nastaliq)' }}>{word.urdu}</span>
                    <Image src={`/images/words/${word.index}.png`} alt={`Sign for ${word.urdu}`} width={88} height={88} style={{ objectFit: 'contain' }} unoptimized />
                    <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{word.english}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ALPHABET MODAL ── */}
      {selectedAlpha && (
        <div onClick={() => setSelectedAlpha(null)} style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', minWidth: 280 }}>
            <button onClick={() => setSelectedAlpha(null)} style={{ position: 'absolute', top: 14, right: 14, padding: 4, lineHeight: 0, color: 'var(--ink-faint)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <span style={{ fontSize: 72, fontWeight: 800, color: 'var(--ink)', direction: 'rtl', lineHeight: 1 }}>{selectedAlpha.c}</span>
            <Image src={`/images/alphabet/${selectedAlpha.index}.png`} alt={`Sign for ${selectedAlpha.c}`} width={220} height={220} style={{ objectFit: 'contain' }} unoptimized />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-nastaliq)', fontSize: 18, color: 'var(--ink)', direction: 'rtl', lineHeight: 1.6 }}>{selectedAlpha.u}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{selectedAlpha.n}</div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Sign {selectedAlpha.index} of {ALPHA_DATA.length}</span>
          </div>
        </div>
      )}

      {/* ── WORD MODAL ── */}
      {selectedWord && (
        <div onClick={() => setSelectedWord(null)} style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', minWidth: 280 }}>
            <button onClick={() => setSelectedWord(null)} style={{ position: 'absolute', top: 14, right: 14, padding: 4, lineHeight: 0, color: 'var(--ink-faint)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--ink)', direction: 'rtl', lineHeight: 1.3, fontFamily: 'var(--font-nastaliq)', textAlign: 'center' }}>{selectedWord.urdu}</span>
            <Image src={`/images/words/${selectedWord.index}.png`} alt={`Sign for ${selectedWord.urdu}`} width={220} height={220} style={{ objectFit: 'contain' }} unoptimized />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>{selectedWord.english}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
