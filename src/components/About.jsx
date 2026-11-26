import { CodeIcon } from './icons.jsx';
import { PROJECT } from '../config.js';

const LIMITS = [
  'Sarcasm, jokes between friends and reclaimed language look the same as abuse to a keyword rule.',
  'Harassment without obvious words (for example, repeated unwanted contact) is missed.',
  'Only English phrases are covered, and slang changes faster than a word list.',
  'Rules can both miss harmful messages and flag harmless ones. A human should review before any action.',
];

export default function About({ onGuide }) {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <header className="section-head">
          <h2 id="about-title">What this demo is, and what it is not</h2>
          <p className="muted">
            {PROJECT.level ? `${PROJECT.level}. ` : ''}The interface is finished. The detection engine behind it is a
            stand-in, so you can present the full experience before a model is trained.
          </p>
        </header>

        <div className="about-grid">
          <div className="about-card demo">
            <span className="badge demo">Demo result</span>
            <h3>Rule-based simulation</h3>
            <ul>
              <li>Matches hand-written patterns and applies context rules.</li>
              <li>Fully explainable: every highlight traces to a rule.</li>
              <li>Runs instantly in the browser with no server.</li>
              <li>Confidence is a heuristic, not a probability.</li>
            </ul>
          </div>
          <div className="about-card model">
            <span className="badge model">Model prediction</span>
            <h3>Trained AI model</h3>
            <ul>
              <li>Learns patterns from labelled examples, so it can read context.</li>
              <li>Returns calibrated probabilities for each category.</li>
              <li>Needs training data, evaluation and a hosted endpoint.</li>
              <li>This app labels its output differently once connected.</li>
            </ul>
          </div>
          <div className="about-card limits">
            <h3>Known limits of the demo</h3>
            <ul>
              {LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="about-cta">
          <div>
            <h3>Ready to connect a real model?</h3>
            <p className="muted">Set one environment variable and the app sends messages to your endpoint instead.</p>
          </div>
          <button type="button" className="btn primary" onClick={onGuide}>
            <CodeIcon size={18} /> Open the integration guide
          </button>
        </div>
      </div>
    </section>
  );
}
