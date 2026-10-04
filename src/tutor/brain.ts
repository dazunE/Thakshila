import type { Lesson } from '../whiteboard/types';
import { fallback, greeting, lessons, multiplicationLesson } from './kidsLessons';
import { teenFallback, teenGreeting, teenLessons } from './teenLessons';

export interface ChatTurn {
  role: 'student' | 'tutor';
  text: string;
}

/**
 * Anything that can turn a student's question into a whiteboard lesson.
 * The prototype ships keyword-matching stand-ins; production calls an LLM
 * with the `teach_on_whiteboard` tool (docs/CONCEPT.md, "Agent design").
 */
export interface TutorBrain {
  greeting: Lesson;
  respond(question: string, history: ChatTurn[]): Promise<Lesson>;
}

const think = () => new Promise((r) => setTimeout(r, 450));

function match(q: string, topics: { lesson: Lesson; words: RegExp }[]): Lesson | undefined {
  return topics.find((t) => t.words.test(q))?.lesson;
}

export const kidsBrain: TutorBrain = {
  greeting,
  async respond(question) {
    await think();
    const q = question.trim();
    const times = q.match(/(\d+)\s*(?:x|×|\*|times|multiplied by)\s*(\d+)/i);
    if (times) {
      const [a, b] = [Number(times[1]), Number(times[2])];
      if (a >= 1 && b >= 1 && a <= 10 && b <= 10) return multiplicationLesson(a, b);
    }
    if (/multipl|times/i.test(q)) return multiplicationLesson(3, 4);
    const hit = match(q, [
      { lesson: lessons.fractions, words: /fraction|half|halves|quarter|third|pizza|\b1\/[2-9]\b/i },
      { lesson: lessons.waterCycle, words: /water cycle|rain|cloud|evaporat|condens|precipitat|puddle/i },
      { lesson: lessons.photosynthesis, words: /plant|photosynth|leaf|leaves|tree|flower|oxygen/i },
      { lesson: lessons.dayNight, words: /day|night|sunrise|sunset|earth spin|dark/i },
    ]);
    if (hit) return hit;
    if (/^(hi|hello|hey|good (morning|afternoon))\b/i.test(q)) return greeting;
    return fallback(q);
  },
};

export const teenBrain: TutorBrain = {
  greeting: teenGreeting,
  async respond(question) {
    await think();
    const q = question.trim();
    const hit = match(q, [
      { lesson: teenLessons.quadratic, words: /quadratic|factori[sz]|parabola|roots?\b|x²|x\^2|x2 ?[-+]/i },
      { lesson: teenLessons.projectile, words: /projectile|trajector|thrown|kick|launch|suvat|motion|velocity/i },
      { lesson: teenLessons.balancing, words: /balanc|chemical equation|reaction|h2o|h₂o|coefficient|stoichiom/i },
      { lesson: teenLessons.cell, words: /cell|organelle|mitochondri|nucleus|ribosome|cytoplasm|membrane/i },
    ]);
    if (hit) return hit;
    if (/^(hi|hello|hey)\b/i.test(q)) return teenGreeting;
    return teenFallback(q);
  },
};
