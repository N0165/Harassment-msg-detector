import { LogoMark } from './icons.jsx';
import { PROJECT } from '../config.js';

export default function Footer({ onGuide }) {
  const credits = [PROJECT.team && `By ${PROJECT.team}`, PROJECT.guide && `Guide: ${PROJECT.guide}`, PROJECT.institution].filter(Boolean);

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a className="brand" href="#top" aria-label={`${PROJECT.name} home`}>
            <LogoMark />
            <span className="brand-name">{PROJECT.name}</span>
          </a>
          <p className="muted">{PROJECT.tagline}. Highlights harmful language, names the category and rates its severity.</p>
          {credits.length > 0 && <p className="muted">{credits.join(' · ')}</p>}
        </div>

        <nav className="footer-col" aria-label="Footer">
          <h4>Explore</h4>
          <a href="#dashboard">Dashboard</a>
          <a href="#analyzer">Analyzer</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About the demo</a>
          <button type="button" className="link-btn" onClick={onGuide}>
            Integration guide
          </button>
        </nav>

        <div className="footer-col">
          <h4>If you are being harassed</h4>
          <p className="muted">
            Save screenshots, block the sender and report the account to the platform. In India you can also file a
            report at{' '}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
              cybercrime.gov.in
            </a>
            .
          </p>
        </div>
      </div>

      <div className="wrap footer-base">
        <p>
          {PROJECT.level ? `${PROJECT.level} · ` : ''}© {new Date().getFullYear()} {PROJECT.name}
        </p>
        <p>Demo build: results come from keyword rules, not a trained AI model.</p>
      </div>
    </footer>
  );
}
