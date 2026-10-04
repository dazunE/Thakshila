import { useCallback, useRef, useState } from 'react';
import { anchorOf, defaultDuration } from '../whiteboard/geometry';
import type { BoardElement, Lesson, Pt, ShapeCommand } from '../whiteboard/types';
import { estimateSpeechMs, speak, stopSpeaking, wait } from '../voice/speech';

interface Callbacks {
  /** Called when the tutor starts saying a step (to show it in the chat). */
  onSay: (lesson: Lesson, stepIndex: number, text: string) => void;
  onFinish: (lesson: Lesson, completed: boolean) => void;
}

/**
 * Plays a lesson: for every step the tutor speaks *while* drawing, and the
 * step only ends once both the voice and the drawing are finished.
 */
export function useLessonPlayer(voiceOn: boolean, cb: Callbacks) {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [playing, setPlaying] = useState<{ lesson: Lesson; step: number } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const keyRef = useRef(0);
  const voiceRef = useRef(voiceOn);
  voiceRef.current = voiceOn;
  const cbRef = useRef(cb);
  cbRef.current = cb;

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

  const play = useCallback(
    async (lesson: Lesson) => {
      // A new question always interrupts the current explanation.
      abortRef.current?.abort();
      stopSpeaking();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const { signal } = ctrl;

      for (let i = 0; i < lesson.steps.length; i++) {
        if (signal.aborted) return;
        const step = lesson.steps[i];
        setPlaying({ lesson, step: i });
        cbRef.current.onSay(lesson, i, step.say);

        const voice = voiceRef.current ? speak(step.say, signal) : wait(estimateSpeechMs(step.say), signal);

        const drawing = (async () => {
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
        })();

        await Promise.all([voice, drawing]);
        if (signal.aborted) return;
        await wait(350, signal);
      }

      if (signal.aborted) return;
      setCursor(null);
      setPlaying(null);
      abortRef.current = null;
      cbRef.current.onFinish(lesson, true);
    },
    [],
  );

  return { elements, highlighted, cursor, playing, play, stop, clearBoard };
}
