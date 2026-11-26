import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Analyzer from './components/Analyzer.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import { DashboardActions, Insights, StatStrip } from './components/Dashboard.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';
import Modal from './components/Modal.jsx';
import { analyzeMessage } from './lib/api.js';
import { analyzeDemo, CATEGORY_BY_ID, SEVERITY } from './lib/analyzer.js';
import { SAMPLES } from './lib/samples.js';
import { copyText } from './lib/clipboard.js';
import { delay, pct, prefersReducedMotion } from './lib/utils.js';

const STORAGE_KEY = 'aegis.history.v1';
const HISTORY_LIMIT = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function reportText(r) {
  const label = r.source === 'demo' ? 'DEMO RESULT (keyword rules, not a trained AI model)' : 'MODEL PREDICTION';
  const terms = r.matches
    .filter((m) => m.effective >= 0.1)
    .map((m) => `"${m.text.trim()}" (${CATEGORY_BY_ID[m.category].label})`)
    .join(', ');
  return [
    `Aegis analysis report: ${label}`,
    `Message: ${r.text}`,
    `Verdict: ${r.verdictLabel}`,
    `Category: ${r.primaryCategory ? CATEGORY_BY_ID[r.primaryCategory].label : 'None'}`,
    `Severity: ${SEVERITY[r.severity].label}`,
    `${r.source === 'demo' ? 'Demo confidence' : 'Model confidence'}: ${pct(r.confidence)}%`,
    `Flagged terms: ${terms || 'None'}`,
    `Suggested next step: ${r.action}`,
  ].join('\n');
}

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [history, setHistory] = useState(loadHistory);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef(null);
  const resultsRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* storage can be unavailable; the app still works without it */
    }
  }, [history]);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const scrollToResultsOnSmallScreens = () => {
    if (window.matchMedia('(max-width: 1020px)').matches) {
      resultsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const runAnalysis = useCallback(
    async (value) => {
      const message = (value ?? text).trim();
      if (!message) {
        showToast('Enter a message to analyze first.');
        textareaRef.current?.focus();
        return;
      }
      setBusy(true);
      setStage(0);
      const reduced = prefersReducedMotion();
      const timers = [setTimeout(() => setStage(1), reduced ? 0 : 380), setTimeout(() => setStage(2), reduced ? 0 : 800)];
      try {
        const [res] = await Promise.all([analyzeMessage(message), delay(reduced ? 150 : 1250)]);
        setResult(res);
        setHistory((h) => [res, ...h].slice(0, HISTORY_LIMIT));
        scrollToResultsOnSmallScreens();
      } finally {
        timers.forEach(clearTimeout);
        setBusy(false);
      }
    },
    [text, showToast]
  );

  const focusAnalyzer = useCallback(() => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 350);
  }, []);

  const pickSample = (s) => {
    setText(s.text);
    textareaRef.current?.focus({ preventScroll: true });
  };

  const trySample = () => {
    const s = SAMPLES.find((x) => x.id === 'insult') || SAMPLES[0];
    setText(s.text);
    runAnalysis(s.text);
  };

  const clearAll = () => {
    setText('');
    setResult(null);
    textareaRef.current?.focus({ preventScroll: true });
  };

  const loadSamples = () => {
    const entries = SAMPLES.map((s, i) => ({ ...analyzeDemo(s.text), sample: true, timestamp: Date.now() - (SAMPLES.length - i) * 1000 }));
    setHistory((h) => [...entries.reverse(), ...h.filter((x) => !x.sample)].slice(0, HISTORY_LIMIT));
    showToast(`Added ${entries.length} sample analyses to the dashboard.`);
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('History cleared.');
  };

  const openFromHistory = (h) => {
    setText(h.text);
    setResult(h);
    scrollToResultsOnSmallScreens();
  };

  const onCopy = async () => {
    if (!result) return;
    const ok = await copyText(reportText(result));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      showToast('Copy is blocked in this browser. Select the text manually.');
    }
  };

  const onDownload = () => {
    if (!result) return;
    const payload = {
      ...result,
      disclaimer:
        result.source === 'demo'
          ? 'Demo result produced by keyword rules. Not a prediction from a trained AI model.'
          : 'Prediction returned by a connected model endpoint.',
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-analysis-${new Date(result.timestamp).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const openGuide = useCallback(() => setGuideOpen(true), []);

  return (
    <>
      <a className="skip" href="#analyzer">
        Skip to the analyzer
      </a>
      <Navbar onTry={focusAnalyzer} onGuide={openGuide} />

      <main>
        <Hero onTry={focusAnalyzer} />

        <section className="section dash" id="dashboard" aria-labelledby="dash-title">
          <div className="wrap">
            <header className="dash-head">
              <div>
                <h2 id="dash-title">Moderation dashboard</h2>
                <p className="muted">Live numbers from the messages you analyze in this browser.</p>
              </div>
              <DashboardActions hasHistory={history.length > 0} onLoadSamples={loadSamples} onClearHistory={clearHistory} />
            </header>

            <StatStrip history={history} />

            <div className="workspace" id="analyzer">
              <Analyzer
                text={text}
                setText={setText}
                onAnalyze={() => runAnalysis()}
                onClear={clearAll}
                onPickSample={pickSample}
                busy={busy}
                stage={stage}
                textareaRef={textareaRef}
              />
              <ResultPanel
                result={result}
                busy={busy}
                onClear={clearAll}
                onSample={trySample}
                onCopy={onCopy}
                onDownload={onDownload}
                onGuide={openGuide}
                copied={copied}
                panelRef={resultsRef}
              />
            </div>

            <Insights history={history} onOpen={openFromHistory} onLoadSamples={loadSamples} />
          </div>
        </section>

        <HowItWorks />
        <About onGuide={openGuide} />
      </main>

      <Footer onGuide={openGuide} />
      <Modal open={guideOpen} onClose={closeGuide} />

      <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
