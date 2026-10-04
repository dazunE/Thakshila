import { useEffect, useState } from 'react';
import { KidsApp } from './kids/KidsApp';
import { ChalkBuddy } from './kids/ChalkBuddy';
import { TeenApp } from './teens/TeenApp';
import { stopSpeaking, unlockSpeech } from './voice/speech';

type Audience = 'kids' | 'teens';

function audienceFromHash(): Audience | null {
  const h = window.location.hash.replace('#', '');
  return h === 'kids' || h === 'teens' ? h : null;
}

function setHash(a: Audience | null) {
  try {
    history.replaceState(null, '', a ? `#${a}` : window.location.pathname);
  } catch {
    /* some sandboxes block history changes; the app works without it */
  }
}

export default function App() {
  const [audience, setAudience] = useState<Audience | null>(audienceFromHash);
  // true when the user just clicked, so the tutor may start talking straight away
  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    document.title = audience === 'kids' ? 'Doodle Classroom' : audience === 'teens' ? 'Doodle Study' : 'Doodle Tutor';
  }, [audience]);

  const choose = (a: Audience) => {
    unlockSpeech(); // inside the click, so browsers allow the voice
    stopSpeaking();
    setAutoStart(true);
    setAudience(a);
    setHash(a);
  };

  if (audience === 'kids') return <KidsApp key="kids" autoStart={autoStart} onSwitch={() => choose('teens')} />;
  if (audience === 'teens') return <TeenApp key="teens" autoStart={autoStart} onSwitch={() => choose('kids')} />;
  return <Landing onChoose={choose} />;
}

function Landing({ onChoose }: { onChoose: (a: Audience) => void }) {
  return (
    <div className="landing">
      <header className="l-head">
        <h1>Doodle Tutor</h1>
        <p>Ask a question out loud. Your tutor answers by talking and drawing on the board at the same time.</p>
      </header>

      <div className="l-cards">
        <button className="l-card l-kids" onClick={() => onChoose('kids')}>
          <div className="l-kids-board">
            <ChalkBuddy mood="idle" size={86} />
            <svg viewBox="0 0 200 120" className="l-chalk" aria-hidden>
              <circle cx="60" cy="60" r="38" />
              <path d="M60 22 V98 M22 60 H98" />
              <path d="M60 60 L60 22 A38 38 0 0 1 98 60 Z" className="l-chalk-fill" />
              <text x="150" y="52">1</text>
              <path d="M132 64 H168" />
              <text x="150" y="100">4</text>
            </svg>
          </div>
          <div className="l-card-body">
            <span className="l-age">Ages 6–12</span>
            <h2>Classroom</h2>
            <p>Chalky, a stick of chalk that loves to draw, teaches on the chalkboard. Tap the mic and talk, or pick a picture. Answer questions to earn stars.</p>
            <span className="l-go">Go to class →</span>
          </div>
        </button>

        <button className="l-card l-teens" onClick={() => onChoose('teens')}>
          <div className="l-teen-boards" aria-hidden>
            <span className="lb lb-graph">
              <b>Maths</b>graph paper
            </span>
            <span className="lb lb-blueprint">
              <b>Physics</b>blueprint
            </span>
            <span className="lb lb-lab">
              <b>Chemistry</b>lab notebook
            </span>
            <span className="lb lb-sketch">
              <b>Biology</b>sketchbook
            </span>
          </div>
          <div className="l-card-body">
            <span className="l-age">Ages 13–18</span>
            <h2>Study</h2>
            <p>Atlas works through problems step by step. The board changes to suit the subject you're studying.</p>
            <span className="l-go">Start studying →</span>
          </div>
        </button>
      </div>

      <p className="l-note">Turn your sound on. The tutor talks to you.</p>
    </div>
  );
}
