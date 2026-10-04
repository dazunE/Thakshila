import { useEffect, useRef, useState } from 'react';
import { Burst } from '../shared/Burst';
import { ReadAlong } from '../shared/ReadAlong';
import { useMic } from '../shared/useMic';
import { useTutorSession, type Message } from '../shared/useTutorSession';
import { MicIcon, VoicePanel } from '../shared/VoicePanel';
import { teenBrain } from '../tutor/brain';
import { listenErrorMessage } from '../voice/speech';
import { BOARD_THEMES, teenThemeFor } from '../whiteboard/themes';
import { Whiteboard } from '../whiteboard/Whiteboard';
import { INK, type Subject } from '../whiteboard/types';

const SUBJECTS: { subject: Subject; q: string; topic: string }[] = [
  { subject: 'Maths', q: 'How do I solve x² − 5x + 6 = 0?', topic: 'Quadratics' },
  { subject: 'Physics', q: 'Explain projectile motion', topic: 'Projectiles' },
  { subject: 'Chemistry', q: 'How do I balance H₂ + O₂ → H₂O?', topic: 'Balancing equations' },
  { subject: 'Biology', q: "What's inside an animal cell?", topic: 'Cell structure' },
];

export function TeenApp({ autoStart, onSwitch }: { autoStart: boolean; onSwitch: () => void }) {
  const s = useTutorSession({
    brain: teenBrain,
    voice: { voiceURI: '', rate: 1.02, pitch: 1 },
    rewardStamp: [{ op: 'text', at: [950, 52], text: '✓', size: 64, color: INK.green }],
  });
  const [started, setStarted] = useState(false);
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const mic = useMic(
    (text) => ask(text),
    () => s.player.stop(),
  );

  const begin = () => {
    setStarted(true);
    s.start();
  };
  useEffect(() => {
    if (autoStart) begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [s.messages, s.thinking, s.player.playing?.step]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setStarted(true);
    mic.clearError();
    void s.ask(t);
  };

  const playing = s.player.playing;
  const subject: Subject = s.lastSubjectLesson?.subject ?? 'Maths';
  const theme = BOARD_THEMES[teenThemeFor(subject)];
  const talking = !!playing;

  return (
    <div className="teens" data-subject={subject.toLowerCase()}>
      <aside className="t-side">
        <header className="t-top">
          <div className={`orb${talking ? ' talking' : ''}${mic.listening ? ' listening' : ''}`} aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="t-who">
            <strong>Atlas</strong>
            <span aria-live="polite">
              {mic.listening ? 'Listening' : s.thinking ? 'Working it out' : talking ? `Explaining · step ${playing.step + 1} of ${playing.lesson.steps.length}` : 'Ready'}
            </span>
          </div>
          <VoicePanel
            voiceOn={s.voiceOn}
            setVoiceOn={s.setVoiceOn}
            settings={s.voice}
            setSettings={s.setVoice}
            sample="Hi, I'm Atlas. Let's work through it together, one step at a time."
          />
        </header>

        <nav className="t-subjects" aria-label="Subjects">
          {SUBJECTS.map((x) => (
            <button
              key={x.subject}
              data-subject={x.subject.toLowerCase()}
              className={subject === x.subject && s.lastSubjectLesson ? 'active' : ''}
              onClick={() => ask(x.q)}
            >
              <span className="t-dot" aria-hidden />
              <span className="t-subj">{x.subject}</span>
              <span className="t-topic">{x.topic}</span>
            </button>
          ))}
        </nav>

        <div className="t-log" ref={logRef}>
          {s.messages.map((m) => (
            <TeenRow
              key={m.id}
              m={m}
              spokenChars={playing && m.playId === s.currentPlayId && m.stepIndex === playing.step ? playing.spokenChars : null}
              onAnswer={(i) => s.answer(m.id, i)}
              onReplay={() => m.lesson && s.teach(m.lesson)}
            />
          ))}
          {s.thinking && (
            <div className="t-row tutor">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>

        {mic.error && (
          <p className="t-mic-error" role="status">
            {listenErrorMessage(mic.error, false)}
          </p>
        )}
        <form
          className="t-composer"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
            setDraft('');
          }}
        >
          <button type="button" className={`t-mic${mic.listening ? ' live' : ''}`} onClick={mic.toggle} aria-pressed={mic.listening} title="Ask by voice">
            <MicIcon size={20} />
          </button>
          <input
            id="teen-question"
            value={mic.listening ? mic.interim : draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={mic.listening ? 'Listening…' : 'Ask a question…'}
            aria-label="Your question"
          />
          <button type="submit" className="t-send" disabled={!draft.trim()}>
            Ask
          </button>
        </form>
        <button className="t-switch" onClick={onSwitch}>
          ← Kids classroom
        </button>
      </aside>

      <main className="t-main">
        <div className="t-toolbar">
          <div className="t-board-name">
            <span className="t-swatch" aria-hidden />
            <span>{theme.name}</span>
            <span className="t-sep">/</span>
            <span className="t-lesson">{s.lastSubjectLesson?.title ?? 'Whiteboard'}</span>
            {playing && playing.lesson.steps.length > 1 && (
              <span className="t-progress" aria-hidden>
                {playing.lesson.steps.map((_, i) => (
                  <i key={i} className={i < playing.step ? 'done' : i === playing.step ? 'now' : ''} />
                ))}
              </span>
            )}
          </div>
          <div className="t-tools">
            {playing && <button onClick={s.player.stop}>Stop</button>}
            <button className={s.penActive ? 'on' : ''} onClick={() => s.setPenActive(!s.penActive)} aria-pressed={s.penActive}>
              Pen
            </button>
            <button onClick={s.clearAll}>Clear</button>
          </div>
        </div>
        <div className={`board theme-${theme.id}`}>
          <Whiteboard
            theme={theme}
            elements={s.player.elements}
            highlighted={s.player.highlighted}
            cursor={s.player.cursor}
            penActive={s.penActive}
            studentStrokes={s.studentStrokes}
            onStudentStroke={s.addStroke}
          />
          {s.celebration > 0 && <Burst key={s.celebration} glyphs={['✦', '•', '✓', '◆']} />}
          {!started && (
            <div className="t-start">
              <p>Your tutor explains out loud while working on the board.</p>
              <button onClick={begin}>Start session</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TeenRow({
  m,
  spokenChars,
  onAnswer,
  onReplay,
}: {
  m: Message;
  spokenChars: number | null;
  onAnswer: (i: number) => void;
  onReplay: () => void;
}) {
  if (m.role === 'student') return <div className="t-row student">{m.text}</div>;

  if (m.kind === 'checkin' && m.checkIn) {
    const c = m.checkIn;
    return (
      <div className={`t-quiz${m.solved ? ' solved' : ''}`}>
        <span className="t-quiz-label">Check your understanding</span>
        <p>{m.text}</p>
        {c.choices && (
          <div className="t-quiz-choices">
            {c.choices.map((ch, i) => {
              const wrong = m.tried?.includes(i);
              const right = m.solved && i === c.answer;
              return (
                <button key={i} className={`${wrong ? 'wrong' : ''}${right ? ' right' : ''}`} disabled={m.solved || wrong} onClick={() => onAnswer(i)}>
                  <span className="t-key">{String.fromCharCode(65 + i)}</span>
                  {ch}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`t-row tutor${spokenChars !== null ? ' speaking' : ''}${m.kind === 'feedback' ? ' feedback' : ''}`}>
      {m.lesson && (
        <div className="t-lesson-head">
          <span className="t-tag" data-subject={m.lesson.subject.toLowerCase()}>
            {m.lesson.subject}
          </span>
          <span className="t-lesson-title">{m.lesson.title}</span>
          <button onClick={onReplay}>Replay</button>
        </div>
      )}
      <ReadAlong text={m.text} spokenChars={spokenChars} />
    </div>
  );
}
