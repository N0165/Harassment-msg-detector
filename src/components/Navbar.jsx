import { useEffect, useState } from 'react';
import { CloseIcon, LogoMark, MenuIcon } from './icons.jsx';
import { PROJECT } from '../config.js';

const LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analyzer', label: 'Analyzer' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'about', label: 'About' },
];

export default function Navbar({ onTry, onGuide }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!('IntersectionObserver' in window) || els.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.6] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a className="brand" href="#top" aria-label={`${PROJECT.name} home`}>
          <LogoMark />
          <span className="brand-name">{PROJECT.name}</span>
          <span className="tag-demo" title="Results come from keyword rules, not a trained model">Demo build</span>
        </a>

        <nav className={`nav-links${open ? ' open' : ''}`} id="primary-nav" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'current' : ''}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => {
              setOpen(false);
              onGuide();
            }}
          >
            Integration guide
          </button>
          <button
            type="button"
            className="btn primary sm nav-cta-mobile"
            onClick={() => {
              setOpen(false);
              onTry();
            }}
          >
            Analyze a message
          </button>
        </nav>

        <div className="nav-actions">
          <button type="button" className="btn primary sm nav-cta" onClick={onTry}>
            Analyze a message
          </button>
          <button
            type="button"
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
