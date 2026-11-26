import { MAX_CHARS } from '../lib/analyzer.js';
import { SAMPLES } from '../lib/samples.js';
import { ScanIcon, TrashIcon } from './icons.jsx';
import { modelConnected } from '../lib/api.js';

export const STAGES = ['Reading the message', 'Matching language patterns', 'Scoring severity'];

export default function Analyzer({ text, setText, onAnalyze, onClear, onPickSample, busy, stage, textareaRef }) {
  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <section className="panel analyzer" aria-labelledby="an-title">
      <div className="panel-head">
        <h2 id="an-title">Message analyzer</h2>
        <span className={`badge ${modelConnected ? 'model' : 'demo'}`}>{modelConnected ? 'Model endpoint' : 'Demo engine'}</span>
      </div>
      <p className="muted">Paste a message, or start from a sample and edit it.</p>

      <div className="samples" role="group" aria-label="Sample messages">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip${text === s.text ? ' on' : ''}`}
            onClick={() => onPickSample(s)}
            disabled={busy}
            aria-pressed={text === s.text}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={`field${busy ? ' scanning' : ''}`}>
        <label htmlFor="message" className="sr">
          Message to analyze
        </label>
        <textarea
          id="message"
          ref={textareaRef}
          rows={7}
          maxLength={MAX_CHARS}
          value={text}
          readOnly={busy}
          placeholder="Paste a message, comment or chat line to analyze…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <span className="scanline" aria-hidden="true" />
      </div>

      <div className="field-foot">
        <span className="count">
          {text.length} / {MAX_CHARS}
        </span>
        <span className="hint">Press Ctrl + Enter (⌘ + Enter on Mac) to analyze</span>
      </div>

      <div className="actions">
        <button type="button" className="btn primary lg grow" onClick={onAnalyze} disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Analyzing
            </>
          ) : (
            <>
              <ScanIcon /> Analyze message
            </>
          )}
        </button>
        <button type="button" className="btn ghost lg" onClick={onClear} disabled={busy || !text}>
          <TrashIcon /> Clear
        </button>
      </div>

      {busy && (
        <ol className="stages" aria-label="Analysis progress">
          {STAGES.map((label, i) => (
            <li key={label} className={i < stage ? 'done' : i === stage ? 'now' : ''}>
              <span className="dot" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
