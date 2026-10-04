import { useEffect, useRef, useState } from 'react';
import { canListen, canSpeak, listen } from '../voice/speech';
import type { Lesson } from '../whiteboard/types';

export interface Message {
  id: number;
  role: 'student' | 'tutor';
  text: string;
  /** Present on the first bubble of a lesson so it can be replayed. */
  lesson?: Lesson;
  lessonId?: string;
  stepIndex?: number;
  kind?: 'step' | 'checkin' | 'thinking';
}

interface Props {
  messages: Message[];
  speaking: { lessonId: string; step: number } | null;
  thinking: boolean;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onSend: (text: string) => void;
  onReplay: (lesson: Lesson) => void;
}

const SUGGESTIONS = [
  'What is a quarter?',
  'How does rain happen?',
  'What is 3 × 5?',
  'How do plants eat?',
  'Why is there night?',
];

const SUBJECT_ICON: Record<Lesson['subject'], string> = {
  Maths: '➗',
  Science: '🔬',
  Geography: '🌍',
  Chat: '💬',
};

export function ChatPanel({ messages, speaking, thinking, voiceOn, onToggleVoice, onSend, onReplay }: Props) {
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const stopListening = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setDraft('');
  };

  const toggleMic = () => {
    if (listening) {
      stopListening.current?.();
      return;
    }
    setListening(true);
    stopListening.current = listen(
      (t) => setDraft(t),
      (final) => {
        setListening(false);
        stopListening.current = null;
        send(final);
      },
    );
  };

  return (
    <div className="chat">
      <header className="chat-header">
        <div className={`avatar${speaking ? ' talking' : ''}`} aria-hidden>
          🦉
        </div>
        <div className="chat-title">
          <strong>Dot</strong>
          <span>{thinking ? 'thinking…' : speaking ? 'explaining on the board' : 'your drawing tutor'}</span>
        </div>
        <button
          className={`icon-btn${voiceOn ? ' on' : ''}`}
          onClick={onToggleVoice}
          disabled={!canSpeak}
          title={voiceOn ? 'Mute Dot' : 'Let Dot talk'}
          aria-pressed={voiceOn}
        >
          {voiceOn ? '🔊' : '🔇'}
        </button>
      </header>

      <div className="messages" ref={listRef}>
        {messages.map((m) => {
          const isSpeaking = !!speaking && m.lessonId === speaking.lessonId && m.stepIndex === speaking.step;
          return (
            <div key={m.id} className={`msg ${m.role}${m.kind ? ` ${m.kind}` : ''}${isSpeaking ? ' speaking' : ''}`}>
              {m.lesson && (
                <div className="lesson-chip">
                  <span>
                    {SUBJECT_ICON[m.lesson.subject]} {m.lesson.subject !== 'Chat' && `${m.lesson.subject} · `}
                    {m.lesson.title}
                  </span>
                  {m.lesson.subject !== 'Chat' && (
                    <button onClick={() => onReplay(m.lesson!)} title="Watch again">
                      ↻ replay
                    </button>
                  )}
                </div>
              )}
              {m.text}
            </div>
          );
        })}
        {thinking && (
          <div className="msg tutor thinking">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <button
          type="button"
          className={`mic${listening ? ' live' : ''}`}
          onClick={toggleMic}
          disabled={!canListen}
          title={canListen ? (listening ? 'Stop listening' : 'Ask with your voice') : 'Voice input is not supported in this browser'}
        >
          🎤
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Ask Dot anything…'}
          aria-label="Your question"
        />
        <button type="submit" className="send" disabled={!draft.trim()}>
          Ask
        </button>
      </form>
    </div>
  );
}
