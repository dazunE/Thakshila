import type { Lesson } from '../whiteboard/types';
import { fallback, greeting, lessons, multiplicationLesson } from './lessons';

export interface ChatTurn {
  role: 'student' | 'tutor';
  text: string;
}

/**
 * Anything that can turn a student's question into a whiteboard lesson.
 * The prototype ships a keyword-matching mock; production would call an LLM
 * with the `teach_on_whiteboard` tool (docs/CONCEPT.md, "Agent design").
 */
export interface TutorBrain {
  respond(question: string, history: ChatTurn[]): Promise<Lesson>;
}

const topics: { lesson: Lesson; words: RegExp }[] = [
  { lesson: lessons.fractions, words: /fraction|half|halves|quarter|third|pizza|numerator|denominator|\b1\/[2-9]\b/i },
  { lesson: lessons.waterCycle, words: /water cycle|rain|cloud|evaporat|condens|precipitat|puddle/i },
  { lesson: lessons.photosynthesis, words: /plant|photosynth|leaf|leaves|tree|flower|oxygen/i },
  { lesson: lessons.dayNight, words: /day|night|sun (rise|set)|sunrise|sunset|earth spin|dark/i },
];

export const mockBrain: TutorBrain = {
  async respond(question) {
    await new Promise((r) => setTimeout(r, 450)); // "thinking"
    const q = question.trim();

    const times = q.match(/(\d+)\s*(?:x|×|\*|times|multiplied by)\s*(\d+)/i);
    if (times) {
      const a = Number(times[1]);
      const b = Number(times[2]);
      if (a >= 1 && b >= 1 && a <= 10 && b <= 10) return multiplicationLesson(a, b);
    }
    if (/multipl|times table|times/i.test(q)) return multiplicationLesson(3, 4);

    const hit = topics.find((t) => t.words.test(q));
    if (hit) return hit.lesson;

    if (/^(hi|hello|hey|good (morning|afternoon))\b/i.test(q)) return greeting;
    return fallback(q);
  },
};
