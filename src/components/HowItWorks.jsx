import { useRef, useState } from 'react';
import { PATTERN_COUNT } from '../lib/analyzer.js';

const STEPS = [
  {
    id: 'input',
    title: 'Message input',
    summary: 'You paste a message, comment or chat line.',
    demo: 'The text is read in your browser. Nothing is sent to a server.',
    model: 'The same text would be sent to a model API over HTTPS.',
  },
  {
    id: 'prep',
    title: 'Pre-processing',
    summary: 'The text is cleaned and split into sentences and clauses.',
    demo: 'Splits on punctuation and keeps character positions so highlights line up. It also checks whether the sentence addresses someone with words like “you” or “your”.',
    model: 'Tokenisation with a subword vocabulary, plus normalisation of spellings such as “u r” and swapped characters.',
  },
  {
    id: 'detect',
    title: 'Detection',
    summary: 'The system looks for language that signals harassment.',
    demo: `${PATTERN_COUNT} hand-written patterns across five categories. Negation, quotation and self-directed remarks reduce the weight of a match.`,
    model: 'A fine-tuned transformer such as BERT or DistilBERT, trained on labelled harassment data, classifies the whole message.',
  },
  {
    id: 'score',
    title: 'Scoring',
    summary: 'Evidence is combined into a category, severity level and confidence value.',
    demo: 'Match weights combine so more evidence raises the score. Fixed thresholds set the severity. Confidence is a heuristic based on how far the score sits from a threshold.',
    model: 'Class probabilities from the model, ideally calibrated, with severity mapped from those probabilities.',
  },
  {
    id: 'explain',
    title: 'Explanation',
    summary: 'The result shows why the message was flagged.',
    demo: 'Highlighted terms, a category breakdown, the reasons behind the score and a suggested next step.',
    model: 'Attribution methods such as attention maps, SHAP or integrated gradients can supply the highlights. A moderator should still review them.',
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const step = STEPS[active];

  const onKeyDown = (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) {
      e.preventDefault();
      const next = (active + keys[e.key] + STEPS.length) % STEPS.length;
      setActive(next);
      tabs.current[next]?.focus();
    }
  };

  return (
    <section className="section how" id="how-it-works" aria-labelledby="how-title">
      <div className="wrap">
        <header className="section-head">
          <h2 id="how-title">How it works</h2>
          <p className="muted">
            Five steps take a message from raw text to an explained result. Pick a step to compare what this demo does
            with what a trained model would do.
          </p>
        </header>

        <div className="how-grid">
          <div className="steps" role="tablist" aria-label="Pipeline steps" aria-orientation="vertical" onKeyDown={onKeyDown}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={active === i}
                aria-controls="step-panel"
                tabIndex={active === i ? 0 : -1}
                className={`step${active === i ? ' on' : ''}${i < active ? ' past' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="step-body">
                  <strong>{s.title}</strong>
                  <small>{s.summary}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="step-panel" id="step-panel" role="tabpanel" aria-labelledby={`tab-${step.id}`} key={step.id}>
            <h3>{step.title}</h3>
            <p className="muted">{step.summary}</p>
            <div className="compare">
              <div className="compare-col demo">
                <span className="badge demo">In this demo</span>
                <p>{step.demo}</p>
              </div>
              <div className="compare-col model">
                <span className="badge model">With a trained model</span>
                <p>{step.model}</p>
              </div>
            </div>
            <div className="step-nav">
              <button type="button" className="btn ghost sm" onClick={() => setActive((active + STEPS.length - 1) % STEPS.length)}>
                Previous step
              </button>
              <button type="button" className="btn soft sm" onClick={() => setActive((active + 1) % STEPS.length)}>
                Next step
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
