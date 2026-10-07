import { useEffect, useState } from 'react';
import { Link, type Path } from '../router';
import { Shanyrak } from './Shanyrak';
import { useUI } from '../ui';

declare const __LITE__: boolean;

const NAV: { to: Path; label: string }[] = [
  { to: '/', label: 'Басты бет' },
  { to: '/otbasy', label: 'Отбасымыз' },
  { to: '/estelikter', label: 'Естеліктер' },
  { to: '/albomdar', label: 'Альбомдар' },
];
const LINKS = __LITE__ ? NAV.filter((n) => n.to !== '/albomdar') : NAV;

export function Nav({ path }: { path: Path }) {
  const [open, setOpen] = useState(false);
  const { admin, login, logout } = useUI();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open]);
  return (
    <>
      <header className={`nav ${path === '/' ? 'on-hero' : ''}`}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <Shanyrak className="brand-mark" />
          <span>Біздің отбасы</span>
        </Link>
        <nav className="nav-links" aria-label="Негізгі мәзір">
          {LINKS.map((n) => <Link key={n.to} to={n.to} className={path === n.to ? 'active' : ''}>{n.label}</Link>)}
        </nav>
        {!__LITE__ && <button className={`login-btn ${admin ? 'on' : ''}`} onClick={admin ? logout : login}>{admin ? 'Шығу' : 'Кіру'}{admin && <small>ADMIN</small>}</button>}
        <button className={`burger ${open ? 'x' : ''}`} onClick={() => setOpen(!open)} aria-label={open ? 'Мәзірді жабу' : 'Мәзірді ашу'} aria-expanded={open}>
          <i /><i />
        </button>
        <div className="nav-progress" aria-hidden />
      </header>
      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <Shanyrak className="mm-art" spin />
        <nav>
          {LINKS.map((n, i) => (
            <Link key={n.to} to={n.to} className={path === n.to ? 'active' : ''} onClick={() => setOpen(false)}>
              <small>{String(i + 1).padStart(2, '0')}</small><span style={{ ['--i' as any]: i }}>{n.label}</span>
            </Link>
          ))}
        </nav>
        {!__LITE__ && <button className={`login-btn mm ${admin ? 'on' : ''}`} onClick={() => { setOpen(false); admin ? logout() : login(); }}>{admin ? 'Шығу (ADMIN)' : 'Кіру'}</button>}
        <p>Бір шаңырақ астындағы махаббат, бірлік пен мәңгілік естеліктер.</p>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <div className="footer-brand">
          <Shanyrak className="footer-mark" />
          <h4>Біздің отбасы</h4>
          <p>Бір шаңырақ астындағы махаббат, бірлік пен мәңгілік естеліктер.</p>
        </div>
        <div className="footer-col">
          <h5>Бөлімдер</h5>
          {LINKS.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
        </div>
        <div className="footer-col">
          <h5>Байланыс</h5>
          <p>Отбасымыздың жылы естеліктерін бірге сақтайық. Жаңа суреттер қосылған сайын галерея толыға береді.</p>
        </div>
      </div>
      <div className="wrap footer-bot"><span>© {new Date().getFullYear()} Біздің отбасы</span><span>Махаббатпен жасалған</span></div>
    </footer>
  );
}

export function SectionHead({ eyebrow, title, em, text, center = false, light = false }: { eyebrow: string; title: string; em?: string; text?: string; center?: boolean; light?: boolean }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''} ${light ? 'light' : ''}`}>
      <span className="eyebrow"><i />{eyebrow}</span>
      <h2>{title} {em && <em>{em}</em>}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
