import { useEffect, useRef, useState } from 'react';
import { Burst } from '../shared/Burst';
import { ReadAlong } from '../shared/ReadAlong';
import { useMic } from '../shared/useMic';
import { useTutorSession, type Message } from '../shared/useTutorSession';
import { MicIcon, VoicePanel } from '../shared/VoicePanel';
import { kidsBrain } from '../tutor/brain';
import { listenErrorMessage } from '../voice/speech';
import { BOARD_THEMES } from '../whiteboard/themes';
import { Whiteboard } from '../whiteboard/Whiteboard';
import { ChalkBuddy, type BuddyMood } from './ChalkBuddy';

const TOPICS = [
  { icon: '🍕', label: 'Fractions', q: 'What is a fraction?' },
  { icon: '✖️', label: 'Times tables', q: 'What is 3 × 4?' },
  { icon: '🌧️', label: 'Rain', q: 'How does rain happen?' },
  { icon: '🌱', label: 'Plants', q: 'How do plants eat?' },
  { icon: '🌍', label: 'Day & night', q: 'Why is there day and night?' },
];

const CHOICE_COLORS = ['c-red', 'c-blue', 'c-green', 'c-yellow'];

export function KidsApp({ autoStart, onSwitch }: { autoStart: boolean; onSwitch: () => void }) {
  const s = useTutorSession({
    brain: kidsBrain,
    voice: { voiceURI: '', rate: 0.92, pitch: 1.15 },
    rewardStamp: [{ op: 'emoji', at: [930, 80], char: '🌟', size: 84 }],
  });
  const [started, setStarted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [cheering, setCheering] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const mic = useMic(
    (text) => s.ask(text),
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
    if (!s.celebration) return;
    setCheering(true);
    const t = setTimeout(() => setCheering(false), 2600);
    return () => clearTimeout(t);
  }, [s.celebration]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [s.messages, s.thinking, s.player.playing?.step]);

  useEffect(() => {
    if (mic.error === 'blocked' || mic.error === 'unsupported' || mic.error === 'no-mic') setTyping(true);
  }, [mic.error]);

  const playing = s.player.playing;
  const mood: BuddyMood = mic.listening ? 'listening' : cheering ? 'cheer' : s.thinking ? 'thinking' : playing ? 'talking' : 'idle';

  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setStarted(true);
    mic.clearError();
    void s.ask(t);
  };

  const status = mic.listening
    ? "I'm listening…"
    : s.thinking
      ? 'Hmm, let me think…'
      : playing
        ? 'Watch the board!'
        : 'Ask me anything!';

  return (
    <div className="kids">
      <aside className="k-side">
        <header className="k-top">
          <div className="k-brand">
            <span className="k-logo">Doodle</span> Classroom
          </div>
          <div className="k-stars" title="Stars you've earned">
            <span aria-hidden>⭐</span> {s.stars}
          </div>
          <VoicePanel
            kids
            voiceOn={s.voiceOn}
            setVoiceOn={s.setVoiceOn}
            settings={s.voice}
            setSettings={s.setVoice}
            sample="Hi! I'm Chalky. Let's draw something fun today!"
          />
        </header>

        <div className="k-teacher">
          <ChalkBuddy mood={mood} size={104} />
          <div className="k-teacher-text">
            <div className="k-plaque">Chalky</div>
            <div className="k-status" aria-live="polite">
              {status}
            </div>
          </div>
          <button className="k-switch" onClick={onSwitch}>
            High school →
          </button>
        </div>

        <div className="k-log" ref={logRef}>
          {s.messages.map((m) => (
            <KidBubble
              key={m.id}
              m={m}
              spokenChars={
                playing && m.playId === s.currentPlayId && m.stepIndex === playing.step ? playing.spokenChars : null
              }
              onAnswer={(i) => s.answer(m.id, i)}
              onReplay={() => m.lesson && s.teach(m.lesson)}
            />
          ))}
          {s.thinking && (
            <div className="kb tutor thinking" aria-label="Chalky is thinking">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>

        <div className="k-ask">
          <div className="k-topics" role="group" aria-label="Pick a lesson">
            {TOPICS.map((t) => (
              <button key={t.label} onClick={() => ask(t.q)}>
                <span className="k-topic-icon" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="k-mic-row">
            <button className={`k-mic${mic.listening ? ' live' : ''}`} onClick={mic.toggle} aria-pressed={mic.listening}>
              <MicIcon size={30} />
              <span>{mic.listening ? (mic.interim || 'Listening… tap to stop') : 'Tap and ask me!'}</span>
            </button>
            <button className={`k-kbd${typing ? ' on' : ''}`} onClick={() => setTyping(!typing)} aria-pressed={typing} title="Type a question">
              ⌨️
            </button>
          </div>

          {mic.error && (
            <p className="k-mic-error" role="status">
              {listenErrorMessage(mic.error, true)}
            </p>
          )}

          {typing && (
            <form
              className="k-type"
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
                setDraft('');
              }}
            >
              <input id="kids-question" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your question…" aria-label="Your question" autoFocus />
              <button type="submit" disabled={!draft.trim()}>
                Ask
              </button>
            </form>
          )}
        </div>
      </aside>

      <main className="k-board-wrap">
        <div className="k-frame">
          <div className="k-board-head">
            <span className="k-lesson-title">{playing && playing.lesson.subject !== 'Chat' ? playing.lesson.title : s.lastSubjectLesson?.title ?? "Today's lesson"}</span>
            {playing && playing.lesson.steps.length > 1 && (
              <span className="k-progress" aria-label={`Step ${playing.step + 1} of ${playing.lesson.steps.length}`}>
                {playing.lesson.steps.map((_, i) => (
                  <i key={i} className={i < playing.step ? 'done' : i === playing.step ? 'now' : ''} />
                ))}
              </span>
            )}
          </div>

          <div className="board theme-chalk">
            <Whiteboard
              theme={BOARD_THEMES.chalk}
              elements={s.player.elements}
              highlighted={s.player.highlighted}
              cursor={s.player.cursor}
              penActive={s.penActive}
              studentStrokes={s.studentStrokes}
              onStudentStroke={s.addStroke}
            />
            {s.celebration > 0 && cheering && <Burst key={s.celebration} glyphs={['⭐', '🌟', '✨', '⭐']} />}
            {!started && (
              <div className="k-start">
                <ChalkBuddy mood="idle" size={120} />
                <p>Class is about to begin!</p>
                <button onClick={begin}>Start class</button>
              </div>
            )}
          </div>

          <div className="k-tray">
            <button className={`chalk-btn${s.penActive ? ' on' : ''}`} onClick={() => s.setPenActive(!s.penActive)} aria-pressed={s.penActive}>
              <span className="chalk-stick" aria-hidden />
              {s.penActive ? 'Drawing!' : 'My chalk'}
            </button>
            {playing && (
              <button className="tray-btn" onClick={s.player.stop}>
                ■ Stop
              </button>
            )}
            <button className="eraser-btn" onClick={s.clearAll}>
              <span className="eraser" aria-hidden />
              Wipe board
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function KidBubble({
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
  if (m.role === 'student') return <div className="kb student">{m.text}</div>;

  if (m.kind === 'checkin' && m.checkIn) {
    const c = m.checkIn;
    return (
      <div className={`kb tutor checkin${m.solved ? ' solved' : ''}`}>
        <p className="kb-q">{m.text}</p>
        {c.choices && (
          <div className="kb-choices">
            {c.choices.map((ch, i) => {
              const wrong = m.tried?.includes(i);
              const right = m.solved && i === c.answer;
              return (
                <button
                  key={i}
                  className={`${CHOICE_COLORS[i % CHOICE_COLORS.length]}${wrong ? ' wrong' : ''}${right ? ' right' : ''}`}
                  disabled={m.solved || wrong}
                  onClick={() => onAnswer(i)}
                >
                  {right && <span aria-hidden>✓ </span>}
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
    <div className={`kb tutor${spokenChars !== null ? ' speaking' : ''}${m.kind === 'feedback' ? ' feedback' : ''}`}>
      {m.lesson && (
        <div className="kb-chip">
          <span>{m.lesson.title}</span>
          <button onClick={onReplay}>↻ Again</button>
        </div>
      )}
      <ReadAlong text={m.text} spokenChars={spokenChars} />
    </div>
  );
}
