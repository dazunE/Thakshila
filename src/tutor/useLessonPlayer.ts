import { useCallback, useRef, useState } from 'react';
import { anchorOf, defaultDuration } from '../whiteboard/geometry';
import type { BoardElement, Lesson, Pt, ShapeCommand } from '../whiteboard/types';
import { estimateSpeechMs, speak, stopSpeaking, wait, type VoiceSettings } from '../voice/speech';

interface Callbacks {
  /** Called when the tutor starts saying a step (to show it in the chat). */
  onSay: (lesson: Lesson, stepIndex: number, text: string) => void;
  onFinish: (lesson: Lesson) => void;
}

export interface Playing {
  lesson: Lesson;
  step: number;
  /** How far through the current sentence the voice has got (characters). */
  spokenChars: number;
}

/**
 * Plays a lesson: for every step the tutor speaks *while* drawing, and the
 * step only ends once both the voice and the drawing are finished.
 */
export function useLessonPlayer(voiceOn: boolean, voice: VoiceSettings, cb: Callbacks) {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const keyRef = useRef(0);
  const live = useRef({ voiceOn, voice, cb });
  live.current = { voiceOn, voice, cb };

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopSpeaking();
    setCursor(null);
    setPlaying(null);
  }, []);

  const clearBoard = useCallback(() => {
    setElements([]);
    setHighlighted(new Set());
  }, []);

  const runDrawing = async (step: Lesson['steps'][number], signal: AbortSignal) => {
    for (const cmd of step.draw) {
      if (signal.aborted) return;
      switch (cmd.op) {
        case 'clear':
          setElements([]);
          setHighlighted(new Set());
          break;
        case 'erase':
          setElements((els) => els.filter((e) => e.cmd.id !== cmd.target));
          break;
        case 'highlight':
          setHighlighted((h) => new Set(h).add(cmd.target));
          break;
        case 'pause':
          break;
        default: {
          const shape = cmd as ShapeCommand;
          setElements((els) => [...els, { key: ++keyRef.current, cmd: shape }]);
          const a = anchorOf(shape);
          if (a) setCursor(a);
        }
      }
      await wait('duration' in cmd && cmd.duration ? cmd.duration : defaultDuration(cmd), signal);
    }
  };

  /** Speak one sentence, reporting read-along progress as it goes. */
  const runVoice = async (lesson: Lesson, step: number, text: string, signal: AbortSignal) => {
    const { voiceOn: on, voice: settings } = live.current;
    const total = estimateSpeechMs(text, settings.rate);
    const started = performance.now();
    let boundaries = false;
    const setChars = (n: number) => setPlaying({ lesson, step, spokenChars: n });
    // Not every voice reports word boundaries, so estimate from time as a fallback.
    const timer = setInterval(() => {
      if (!boundaries) setChars(Math.min(text.length, Math.floor(((performance.now() - started) / total) * text.length)));
    }, 120);
    try {
      if (on) {
        await speak(text, settings, signal, (i) => {
          boundaries = true;
          setChars(i);
        });
      } else {
        await wait(total, signal);
      }
    } finally {
      clearInterval(timer);
    }
    if (!signal.aborted) setChars(text.length);
  };

  const play = useCallback(async (lesson: Lesson) => {
    // A new question always interrupts the current explanation.
    abortRef.current?.abort();
    stopSpeaking();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const { signal } = ctrl;

    for (let i = 0; i < lesson.steps.length; i++) {
      if (signal.aborted) return;
      const step = lesson.steps[i];
      setPlaying({ lesson, step: i, spokenChars: 0 });
      live.current.cb.onSay(lesson, i, step.say);
      await Promise.all([runVoice(lesson, i, step.say, signal), runDrawing(step, signal)]);
      if (signal.aborted) return;
      await wait(300, signal);
    }

    if (signal.aborted) return;
    setCursor(null);
    setPlaying(null);
    abortRef.current = null;
    live.current.cb.onFinish(lesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { elements, highlighted, cursor, playing, play, stop, clearBoard };
}
