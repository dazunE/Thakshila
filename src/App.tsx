import { useRef, useState } from 'react';
import { ChatPanel, type Message } from './components/ChatPanel';
import { mockBrain, type ChatTurn } from './tutor/brain';
import { greeting } from './tutor/lessons';
import { useLessonPlayer } from './tutor/useLessonPlayer';
import { canSpeak } from './voice/speech';
import { Whiteboard } from './whiteboard/Whiteboard';
import type { Lesson, Pt } from './whiteboard/types';

export default function App() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(canSpeak);
  const [penActive, setPenActive] = useState(false);
  const [studentStrokes, setStudentStrokes] = useState<Pt[][]>([]);
  const idRef = useRef(0);
  const runRef = useRef(0);
  // each playback gets its own id so replays don't light up old bubbles
  const playRef = useRef(0);

  const push = (m: Omit<Message, 'id'>) => setMessages((ms) => [...ms, { ...m, id: ++idRef.current }]);

  const player = useLessonPlayer(voiceOn, {
    onSay: (lesson, step, text) =>
      push({
        role: 'tutor',
        text,
        lessonId: String(playRef.current),
        stepIndex: step,
        kind: 'step',
        lesson: step === 0 ? lesson : undefined,
      }),
    onFinish: (lesson) => {
      if (lesson.checkIn) push({ role: 'tutor', text: lesson.checkIn, kind: 'checkin' });
    },
  });

  const teach = (lesson: Lesson) => {
    setStarted(true);
    setStudentStrokes([]);
    playRef.current++;
    void player.play(lesson);
  };

  const ask = async (text: string) => {
    const run = ++runRef.current;
    setStarted(true);
    player.stop(); // the student interrupting always wins
    push({ role: 'student', text });
    setThinking(true);
    const history: ChatTurn[] = messages.map((m) => ({ role: m.role, text: m.text }));
    const lesson = await mockBrain.respond(text, history);
    if (run !== runRef.current) return; // a newer question arrived meanwhile
    setThinking(false);
    teach(lesson);
  };

  const start = () => teach(greeting);

  const playing = player.playing;

  return (
    <div className="app">
      <aside className="tutor-panel">
        <ChatPanel
          messages={messages}
          speaking={playing ? { lessonId: String(playRef.current), step: playing.step } : null}
          thinking={thinking}
          voiceOn={voiceOn}
          onToggleVoice={() => setVoiceOn((v) => !v)}
          onSend={ask}
          onReplay={teach}
        />
      </aside>

      <main className="board-panel">
        <div className="board-toolbar">
          <div className="board-status">
            {playing ? (
              <>
                <span className="live-dot" /> {playing.lesson.title}
                <span className="steps">
                  {playing.lesson.steps.map((_, i) => (
                    <i key={i} className={i < playing.step ? 'done' : i === playing.step ? 'now' : ''} />
                  ))}
                </span>
              </>
            ) : (
              <span className="muted">Whiteboard</span>
            )}
          </div>
          <div className="board-tools">
            {playing && (
              <button onClick={player.stop} title="Stop">
                ⏹ Stop
              </button>
            )}
            <button className={penActive ? 'on' : ''} onClick={() => setPenActive((p) => !p)} aria-pressed={penActive} title="Draw on the board yourself">
              🖍 My pen
            </button>
            <button
              onClick={() => {
                player.stop();
                player.clearBoard();
                setStudentStrokes([]);
              }}
              title="Wipe the board"
            >
              🧽 Clear
            </button>
          </div>
        </div>

        <div className="board">
          <Whiteboard
            elements={player.elements}
            highlighted={player.highlighted}
            cursor={player.cursor}
            penActive={penActive}
            studentStrokes={studentStrokes}
            onStudentStroke={(s) => setStudentStrokes((all) => [...all, s])}
          />
          {!started && (
            <div className="start-overlay">
              <div className="start-card">
                <div className="big-owl">🦉</div>
                <h1>Learn by drawing with Dot</h1>
                <p>Ask a question by typing or talking. Dot will explain it out loud while drawing it on this board.</p>
                <button onClick={start}>Start ▶</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
