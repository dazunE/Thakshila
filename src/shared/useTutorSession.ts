import { useRef, useState } from 'react';
import type { TutorBrain } from '../tutor/brain';
import { useLessonPlayer } from '../tutor/useLessonPlayer';
import { canSpeak, unlockSpeech, type VoiceSettings } from '../voice/speech';
import type { CheckIn, DrawCommand, Lesson, Pt } from '../whiteboard/types';

export interface Message {
  id: number;
  role: 'student' | 'tutor';
  text: string;
  kind?: 'step' | 'checkin' | 'feedback';
  /** Which playback this bubble belongs to (so replays don't light up old bubbles). */
  playId?: number;
  stepIndex?: number;
  /** On the first bubble of a lesson, for the title chip and replay. */
  lesson?: Lesson;
  checkIn?: CheckIn;
  /** Wrong choices already tried, and whether it's been answered correctly. */
  tried?: number[];
  solved?: boolean;
}

interface Options {
  brain: TutorBrain;
  voice: VoiceSettings;
  /** Drawn on the board when the student gets a check-in right. */
  rewardStamp: DrawCommand[];
}

export function useTutorSession({ brain, voice: initialVoice, rewardStamp }: Options) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(canSpeak);
  const [voice, setVoice] = useState(initialVoice);
  const [penActive, setPenActive] = useState(false);
  const [studentStrokes, setStudentStrokes] = useState<Pt[][]>([]);
  const [stars, setStars] = useState(0);
  const [celebration, setCelebration] = useState(0);
  const [lastSubjectLesson, setLastSubjectLesson] = useState<Lesson | null>(null);

  const idRef = useRef(0);
  const askRef = useRef(0);
  const playRef = useRef(0);

  const push = (m: Omit<Message, 'id'>) => setMessages((ms) => [...ms, { ...m, id: ++idRef.current }]);

  const player = useLessonPlayer(voiceOn, voice, {
    onSay: (lesson, step, text) =>
      push({
        role: 'tutor',
        text,
        kind: lesson.id === 'feedback' ? 'feedback' : 'step',
        playId: playRef.current,
        stepIndex: step,
        lesson: step === 0 && lesson.subject !== 'Chat' ? lesson : undefined,
      }),
    onFinish: (lesson) => {
      if (lesson.checkIn) push({ role: 'tutor', text: lesson.checkIn.question, kind: 'checkin', checkIn: lesson.checkIn, tried: [] });
    },
  });

  const teach = (lesson: Lesson) => {
    if (lesson.id !== 'feedback') setStudentStrokes([]);
    if (lesson.subject !== 'Chat') setLastSubjectLesson(lesson);
    playRef.current++;
    void player.play(lesson);
  };

  /** Must be called from a click: unlocks audio, then says hello. */
  const start = () => {
    unlockSpeech();
    teach(brain.greeting);
  };

  const ask = async (text: string) => {
    const run = ++askRef.current;
    player.stop(); // the student interrupting always wins
    push({ role: 'student', text });
    setThinking(true);
    const lesson = await brain.respond(
      text,
      messages.map((m) => ({ role: m.role, text: m.text })),
    );
    if (run !== askRef.current) return; // a newer question arrived meanwhile
    setThinking(false);
    teach(lesson);
  };

  const feedback = (say: string, draw: DrawCommand[]): Lesson => ({
    id: 'feedback',
    title: 'Check-in',
    subject: 'Chat',
    steps: [{ say, draw }],
  });

  const answer = (msgId: number, choice: number) => {
    const msg = messages.find((m) => m.id === msgId);
    const c = msg?.checkIn;
    if (!msg || !c || msg.solved || c.answer === undefined || !c.choices) return;
    push({ role: 'student', text: c.choices[choice] });
    if (choice === c.answer) {
      setMessages((ms) => ms.map((m) => (m.id === msgId ? { ...m, solved: true } : m)));
      setStars((s) => s + 1);
      setCelebration((n) => n + 1);
      teach(feedback(c.praise ?? 'Correct!', rewardStamp));
    } else {
      setMessages((ms) => ms.map((m) => (m.id === msgId ? { ...m, tried: [...(m.tried ?? []), choice] } : m)));
      teach(feedback(c.hint ?? 'Not quite. Have another look at the board.', []));
    }
  };

  const clearAll = () => {
    player.stop();
    player.clearBoard();
    setStudentStrokes([]);
  };

  return {
    messages,
    thinking,
    voiceOn,
    setVoiceOn,
    voice,
    setVoice,
    penActive,
    setPenActive,
    studentStrokes,
    addStroke: (s: Pt[]) => setStudentStrokes((all) => [...all, s]),
    stars,
    celebration,
    lastSubjectLesson,
    currentPlayId: playRef.current,
    player,
    start,
    ask,
    answer,
    teach,
    clearAll,
  };
}

export type TutorSession = ReturnType<typeof useTutorSession>;
