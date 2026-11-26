# Aegis: online harassment detection (demo front end)

A React + Vite interface for an AI-powered online harassment detection system, built for a final-year B.Tech project demonstration.

**Important:** the detection engine in this build is a **rule-based demo**, not a trained AI model. Every result is labelled **Demo result**. When a real model endpoint is connected, results are labelled **Model prediction**.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
npm test           # checks the demo analyzer against the sample messages
```

## What is in the app

- Sticky navbar with section links, mobile menu and a permanent "Demo build" tag
- Hero with an example analysis generated live by the demo engine
- Moderation dashboard: session stats, category chart, severity mix, recent analyses
- Message analyzer with 9 sample messages, character counter, Ctrl/Cmd + Enter shortcut and a staged analysis animation
- Results panel: verdict, category, severity meter, confidence ring, highlighted words, category breakdown, flagged terms, reasons, suggested next step, copy report and JSON download
- How it works (interactive): each step compares "In this demo" with "With a trained model"
- About section listing what the demo does, what a model adds and the known limits
- Integration guide dialog with the request/response contract
- History is kept in `localStorage` (this browser only)

## How the demo engine works

`src/lib/analyzer.js` holds a lexicon of hand-written patterns in five categories (abusive language, threat, hate speech, sexual harassment, cyberbullying). Context rules adjust each match:

| Rule | Effect |
| --- | --- |
| Negation ("I'm not saying you're an idiot") | weight x 0.15 |
| Not aimed at a person ("this movie was stupid") | weight reduced |
| Self-directed ("I'm such an idiot") | weight x 0.2 |
| Quoted or reported speech | weight x 0.45 |
| Aimed at "you" / "your" / @mention | weight x 1.12 |

Category scores combine with a noisy-OR rule. Severity comes from fixed thresholds. The confidence value is a heuristic (distance from a threshold plus how many signals agree), not a statistical probability, and the UI says so.

## Connecting a real model

1. Serve a model behind an HTTP endpoint (for example FastAPI with a fine-tuned BERT classifier) and enable CORS.
2. Create `.env` in the project root:

   ```
   VITE_ANALYZE_API_URL=http://localhost:8000/analyze
   ```

3. Restart `npm run dev`. The endpoint receives and returns:

   ```
   POST { "text": "message to analyze" }
   -> { "category": "threat", "confidence": 0.93, "severity": "high",
        "spans": [{ "start": 0, "end": 19, "category": "threat" }] }
   ```

   `category`: abuse | threat | hate | sexual | bullying | none. `severity`: none | low | medium | high | critical.

If the endpoint is unreachable the app falls back to the demo engine and says so in the result.

## Personalising

Edit `src/config.js` to add your name, guide and institution to the footer. Empty values are hidden.

## Project layout

```
src/
  App.jsx                 state, actions, layout
  config.js               project name and credits
  styles.css              theme and responsive layout
  lib/analyzer.js         demo engine (lexicon, context rules, scoring)
  lib/api.js              demo/model switch and response normalisation
  lib/samples.js          sample messages
  components/             Navbar, Hero, Analyzer, ResultPanel, Dashboard,
                          HowItWorks, About, Footer, Modal, icons
scripts/test-analyzer.mjs analyzer checks
```

## Responsible use

Automated detection makes mistakes, especially with sarcasm, reclaimed language and context. Treat results as a prompt for human review, never as grounds for action on their own.

