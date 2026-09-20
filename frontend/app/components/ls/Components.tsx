"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '../ThemeProvider';
import * as I from './Icons';

/* ── Logo ──────────────────────────────────────────────── */
export function Logo({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.34,
        background: 'linear-gradient(135deg, var(--green), var(--green-deep))',
        display: 'grid', placeItems: 'center', color: 'white',
        boxShadow: '0 6px 16px oklch(0.74 0.16 158 / 0.4)', flexShrink: 0,
        transform: 'rotate(-4deg)',
      }}>
        <I.Hand size={size * 0.62} sw={1.9} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.62, letterSpacing: '-0.02em', color: light ? 'white' : 'var(--ink)' }}>
        lingua<span style={{ color: 'var(--primary)' }}>sign</span>
      </span>
    </div>
  );
}

/* ── Theme toggle ──────────────────────────────────────── */
export function LsThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button onClick={toggle} aria-label="Toggle theme" style={{
      width: 58, height: 32, borderRadius: 999, position: 'relative',
      background: dark ? 'var(--surface-2)' : 'var(--green-soft)',
      boxShadow: 'inset 0 2px 6px oklch(0 0 0 / 0.12)', transition: 'background 0.3s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: dark ? 29 : 3, width: 26, height: 26,
        borderRadius: 999, background: dark ? 'var(--violet)' : 'var(--amber)',
        display: 'grid', placeItems: 'center', color: 'white',
        transition: 'left 0.3s var(--ease)', boxShadow: '0 2px 6px oklch(0 0 0 / 0.25)',
      }}>
        {dark ? <I.Moon size={16} sw={2.2} /> : <I.Sun size={16} sw={2.2} />}
      </span>
    </button>
  );
}

/* ── Avatar ─────────────────────────────────────────────── */
export function Avatar({ name = 'User', size = 40, ring = false }: { name?: string; size?: number; ring?: boolean }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: 'linear-gradient(135deg, var(--coral), var(--amber))',
      display: 'grid', placeItems: 'center', color: 'white',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.4,
      boxShadow: ring ? '0 0 0 3px var(--surface), 0 0 0 5px var(--green)' : 'var(--shadow-sm)',
    }}>{initials}</div>
  );
}

/* ── Hand skeleton SVG ──────────────────────────────────── */
const LM: Record<number, [number, number]> = {
  0:[100,225],1:[72,202],2:[52,182],3:[40,162],4:[32,144],
  5:[82,150],6:[76,114],7:[72,90],8:[69,70],
  9:[101,145],10:[100,106],11:[99,80],12:[98,58],
  13:[120,150],14:[124,112],15:[127,88],16:[129,68],
  17:[140,158],18:[148,128],19:[153,108],20:[157,90],
};
const BONES = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const TIP = [4,8,12,16,20];

export function HandSkeleton({ color = 'white', accent = 'var(--green)' }: { color?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 200 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {BONES.map(([a,b],i) => (
        <line key={'b'+i} x1={LM[a][0]} y1={LM[a][1]} x2={LM[b][0]} y2={LM[b][1]}
          stroke={color} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
      ))}
      {Object.entries(LM).map(([k,[x,y]]) => (
        <circle key={'p'+k} cx={x} cy={y} r={TIP.includes(+k) ? 4.5 : 3.2}
          fill={TIP.includes(+k) ? accent : color} stroke="white" strokeWidth={1}
          style={{ animation: `nodePulse 1.6s ease-in-out ${+k * 0.05}s infinite` }} />
      ))}
    </svg>
  );
}

/* ── Eyebrow pill ───────────────────────────────────────── */
export function Eyebrow({ icon: Ic, children, color = 'green' }: { icon?: React.FC<I.IconProps>; children: React.ReactNode; color?: string }) {
  return (
    <span className="tag-pill" style={{ background: `var(--${color}-soft)`, color: `var(--${color}-deep, var(--ink))` }}>
      {Ic && <Ic size={15} />}{children}
    </span>
  );
}

/* ── Sidebar ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { key: '/sign',        label: 'Detect',     Icon: I.Camera },
  { key: '/dashboard',   label: 'Dashboard',  Icon: I.Chart },
  { key: '/learn',       label: 'Learn',      Icon: I.Book },
  { key: '/live-learn',  label: 'Live Learn', Icon: I.Play },
  { key: '/live-quiz',   label: 'Live Quiz',  Icon: I.Target },
];

function PanelIcon({ flipped }: { flipped?: boolean }) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: flipped ? 'scaleX(-1)' : undefined }}>
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [logoHover, setLogoHover] = useState(false);

  return (
    <aside className="ls-sidebar" style={{
      width: collapsed ? 62 : 248,
      padding: collapsed ? '22px 10px' : '22px 16px',
      transition: 'width 0.25s ease, padding 0.25s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '4px 0 22px', gap: 8 }}>
        {collapsed ? (
          /* Collapsed: hand icon morphs into unfold button on hover */
          <button
            onClick={() => setCollapsed(false)}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            title="Expand sidebar"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            {logoHover ? (
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'var(--green-soft)', border: '1px solid var(--primary)',
                display: 'grid', placeItems: 'center', color: 'var(--primary)',
                transition: 'all 0.15s',
              }}>
                <PanelIcon flipped />
              </div>
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 32 * 0.34,
                background: 'linear-gradient(135deg, var(--green), var(--green-deep))',
                display: 'grid', placeItems: 'center', color: 'white',
                boxShadow: '0 6px 16px oklch(0.74 0.16 158 / 0.4)', transform: 'rotate(-4deg)',
                transition: 'all 0.15s',
              }}>
                <I.Hand size={20} sw={1.9} />
              </div>
            )}
          </button>
        ) : (
          /* Expanded: logo + collapse button */
          <>
            <Link href="/"><Logo size={32} /></Link>
            <button onClick={() => setCollapsed(true)} title="Collapse sidebar" style={{
              width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)',
              border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
              color: 'var(--ink-soft)', cursor: 'pointer', flexShrink: 0,
            }}>
              <PanelIcon />
            </button>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const active = pathname === key;
          return (
            <Link key={key} href={key} title={collapsed ? label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 13,
              padding: collapsed ? '12px 0' : '12px 15px',
              justifyContent: collapsed ? 'center' : undefined,
              borderRadius: 'var(--radius)', fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 15.5, textDecoration: 'none',
              color: active ? 'var(--on-primary)' : 'var(--ink-soft)',
              background: active ? 'var(--primary)' : 'transparent',
              boxShadow: active ? '0 6px 16px oklch(0.74 0.16 158 / 0.3)' : 'none',
              transition: 'all 0.2s',
            }}>
              <Icon size={21} sw={active ? 2.3 : 2} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

/* ── Mobile bottom nav ──────────────────────────────────── */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="ls-mobilenav">
      {NAV_ITEMS.map(({ key, Icon }) => {
        const active = pathname === key;
        return (
          <Link key={key} href={key} style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '10px 0', color: active ? 'var(--primary)' : 'var(--ink-faint)', textDecoration: 'none' }}>
            <Icon size={24} sw={active ? 2.4 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Site-wide footer ───────────────────────────────────── */
export function LsFooter() {
  return (
    <footer style={{ background: 'oklch(0.31 0.05 162)', color: 'white', marginTop: 'auto' }}>
      <div className="ls-footer-grid">
        <div>
          <Logo size={34} light />
          <p style={{ marginTop: 18, fontSize: 14.5, color: 'rgba(255,255,255,0.72)', maxWidth: 300, lineHeight: 1.7 }}>
            Making Pakistan Sign Language understood everywhere — translate signs in real time, and learn to sign back.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {[I.Facebook, I.Twitter, I.Instagram, I.LinkedIn, I.YouTube].map((Ic, k) => (
              <a key={k} href="#" aria-label="social" className="ls-social"><Ic size={18} /></a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16, color: 'white', fontFamily: 'var(--font-display)' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {([['Live Detect', '/sign'], ['Learn PSL', '/learn'], ['Dashboard', '/dashboard'], ['Sign up', '/auth']] as [string, string][]).map(([l, h]) => (
              <Link key={h} href={h} className="ls-footer-link">{l}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16, color: 'white', fontFamily: 'var(--font-display)' }}>Resources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {['PSL Alphabet', 'About PSL', 'Accessibility', 'Help center'].map(l => (
              <a key={l} href="#" className="ls-footer-link">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 18, marginBottom: 16, color: 'white', fontFamily: 'var(--font-display)' }}>Get in touch</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14.5, color: 'rgba(255,255,255,0.72)' }}>
            <span>Lahore, Pakistan</span>
            <Link href="/contact" className="ls-footer-link">wow.992du@gmail.com</Link>
            <span>+92 300 0700908</span>
            <span>Mon–Fri · 9am–6pm PKT</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.13)' }}>
        <div className="ls-footer-bottom">
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.66)' }}>© 2026 LinguaSign · Made with care for the Deaf community of Pakistan</p>
          <div style={{ display: 'flex', gap: 22 }}>
            <a href="#" className="ls-footer-link">Privacy</a>
            <a href="#" className="ls-footer-link">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── App shell (sidebar + content) ─────────────────────── */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ls-scope" style={{ height: '100vh', background: 'var(--bg)' }}>
      <div className="ls-app">
        <Sidebar />
        <main className="ls-main">
          {children}
          <LsFooter />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

/* ── Session avatar / auth button ───────────────────────── */
function TopBarUser() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === 'loading') return <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--surface-2)' }} />;

  if (!session) {
    return (
      <Link href="/auth" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
        Sign in
      </Link>
    );
  }

  const name = session.user?.name ?? 'User';
  const image = session.user?.image;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        {image
          ? <img src={image} alt={name} width={40} height={40} referrerPolicy="no-referrer" style={{ borderRadius: 999, display: 'block', boxShadow: 'var(--shadow-sm)' }} />
          : <Avatar name={name} size={40} ring />
        }
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 48, background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', minWidth: 200, zIndex: 50, overflow: 'hidden',
        }} onClick={() => setOpen(false)}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 2 }}>{name}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-faint)' }}>{session.user?.email}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{
            width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none',
            color: 'var(--ink-soft)', fontSize: 14.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <I.ArrowLeft size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Top bar (used inside app pages) ───────────────────── */
export function TopBar({ title, sub, action, titleHref }: { title: string; sub?: string; action?: React.ReactNode; titleHref?: string }) {
  return (
    <div className="ls-topbar">
      <div>
        {titleHref
          ? <Link href={titleHref} style={{ textDecoration: 'none', color: 'inherit' }}><h1 className="ls-topbar-title">{title}</h1></Link>
          : <h1 className="ls-topbar-title">{title}</h1>
        }
        {sub && <p className="ls-topbar-sub" style={{ color: 'var(--ink-faint)', fontSize: 14.5, marginTop: 2 }}>{sub}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="ls-icon-btn ls-topbar-bell" title="Notifications"><I.Bell size={21} /></button>
        <LsThemeToggle />
        {action}
        <span className="ls-topbar-avatar"><TopBarUser /></span>
      </div>
    </div>
  );
}

/* ── Public nav (marketing + info pages) ────────────────── */
const PUB_LINKS = [
  { href: '/about',         label: 'About' },
  { href: '/how-it-works',  label: 'How It Works' },
  { href: '/contact',       label: 'Contact' },
  { href: '/feedback',      label: 'Feedback' },
  { href: '/dictionary',    label: 'Dictionary' },
  { href: '/donate',        label: 'Donate' },
];

export function LsPublicNav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px,4vw,60px)', height: 68,
        borderBottom: '1px solid var(--line)', background: 'color-mix(in oklch, var(--bg) 88%, transparent)',
        position: 'sticky', top: 0, zIndex: 40,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}>
        <Link href="/"><Logo size={30} /></Link>
        <div className="ls-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {PUB_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-display)', fontWeight: active === l.href ? 700 : 500,
              fontSize: 14.5, color: active === l.href ? 'var(--ink)' : 'var(--ink-soft)', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = active === l.href ? 'var(--ink)' : 'var(--ink-soft)'}
            >{l.label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LsThemeToggle />
          <Link href="/auth" className="btn btn-ghost btn-sm ls-hide-sm" style={{ textDecoration: 'none' }}>Log in</Link>
          <Link href="/auth" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>Get started</Link>
          <button onClick={() => setOpen(true)} aria-label="Menu" className="ls-pub-hamburger">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 5h16M3 11h16M3 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <Link href="/" onClick={() => setOpen(false)}><Logo size={30} /></Link>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--ink)', padding: 4 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M6 6l10 10M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {[...PUB_LINKS, { href: '/sign', label: 'Live Detection' }, { href: '/learn', label: 'Learn Signs' }].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', padding: '16px 0', borderBottom: '1px solid var(--line)' }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', gap: 14, alignItems: 'center' }}>
            <LsThemeToggle />
            <Link href="/auth" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get started</Link>
          </div>
        </div>
      )}
    </>
  );
}
