import { analyzeDemo, buildSegments, CATEGORY_BY_ID, SEVERITY } from '../lib/analyzer.js';
import { pct, tint } from '../lib/utils.js';
import { LockIcon, LayersIcon, ScanIcon } from './icons.jsx';
import { PATTERN_COUNT } from '../lib/analyzer.js';

// The hero example is produced by the same demo engine the analyzer uses.
const HERO_TEXT = "You're such a pathetic loser. Nobody likes you, so just stop posting.";
const HERO = analyzeDemo(HERO_TEXT);

export default function Hero({ onTry }) {
  const segments = buildSegments(HERO.text, HERO.matches);
  const sev = SEVERITY[HERO.severity];
  let hlIndex = 0;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">See exactly what makes a message harassing</h1>
          <p className="lead">
            Paste a message and Aegis highlights the harmful language, names the category and rates how severe it is.
            This build runs a transparent keyword-rule demo so you can explore the interface. A trained model plugs in
            later, and every result says which one produced it.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn primary lg" onClick={onTry}>
              <ScanIcon /> Analyze a message
            </button>
            <a className="btn ghost lg" href="#how-it-works">
              How it works
            </a>
          </div>
          <ul className="facts">
            <li>
              <LayersIcon /> <span>5 harassment categories, 4 severity levels</span>
            </li>
            <li>
              <LockIcon /> <span>Runs in your browser. Nothing is uploaded.</span>
            </li>
            <li>
              <ScanIcon /> <span>{PATTERN_COUNT} rule patterns in the demo engine</span>
            </li>
          </ul>
        </div>

        <figure className="hero-card" aria-label="Example analysis of a harassing message">
          <figcaption className="hero-card-head">
            <span>Example analysis</span>
            <span className="badge demo">Demo result</span>
          </figcaption>

          <p className="hero-msg">
            {segments.map((s, i) => {
              if (!s.match) return <span key={i}>{s.text}</span>;
              const cat = CATEGORY_BY_ID[s.match.category];
              const delay = 0.9 + hlIndex++ * 0.45;
              return (
                <mark
                  key={i}
                  className="hero-hl"
                  style={{ '--c': cat.color, '--cbg': tint(cat.color, 0.22), '--d': `${delay}s` }}
                >
                  {s.text}
                </mark>
              );
            })}
          </p>

          <dl className="hero-readout" style={{ '--after': `${0.9 + hlIndex * 0.45 + 0.2}s` }}>
            <div>
              <dt>Categories</dt>
              <dd className="pill-row">
                {HERO.categories
                  .filter((c) => c.score >= 0.25)
                  .map((c) => (
                    <span key={c.id} className="pill" style={{ '--c': CATEGORY_BY_ID[c.id].color }}>
                      <i aria-hidden="true" />
                      {c.label}
                    </span>
                  ))}
              </dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>
                <strong style={{ color: sev.color }}>{sev.label}</strong>
              </dd>
            </div>
            <div>
              <dt>Demo confidence</dt>
              <dd>
                <strong>{pct(HERO.confidence)}%</strong>
              </dd>
            </div>
          </dl>
          <p className="hero-note">Generated live by the demo engine from the message above.</p>
        </figure>
      </div>
    </section>
  );
}
