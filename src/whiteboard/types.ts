/**
 * The whiteboard drawing language.
 *
 * The tutor never draws pixels directly. It emits a small, JSON-friendly list of
 * commands on a fixed 1000 x 640 canvas. The same schema is what a real LLM would
 * produce through a `teach_on_whiteboard` tool call (see docs/CONCEPT.md).
 */

export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 640;

export type Pt = [number, number];

interface StyleProps {
  /** Optional id so later steps can highlight or erase this element. */
  id?: string;
  color?: string;
  /** Stroke width in board units. */
  width?: number;
  /** How long the "pen" takes to draw this element, in ms. */
  duration?: number;
  opacity?: number;
}

export type DrawCommand =
  | (StyleProps & { op: 'line'; from: Pt; to: Pt; dashed?: boolean })
  | (StyleProps & { op: 'arrow'; from: Pt; to: Pt; /** bend; + bulges left of travel */ curve?: number })
  | (StyleProps & { op: 'circle'; center: Pt; r: number; fill?: string })
  | (StyleProps & { op: 'rect'; at: Pt; size: [number, number]; fill?: string; radius?: number })
  | (StyleProps & {
      op: 'wedge';
      center: Pt;
      r: number;
      /** Degrees. 0 = right (3 o'clock), clockwise is positive. */
      fromDeg: number;
      toDeg: number;
      fill?: string;
    })
  | (StyleProps & { op: 'path'; d: string; fill?: string })
  | (StyleProps & {
      op: 'text';
      at: Pt;
      text: string;
      size?: number;
      anchor?: 'start' | 'middle' | 'end';
    })
  | (StyleProps & { op: 'emoji'; at: Pt; char: string; size?: number })
  | { op: 'highlight'; target: string }
  | { op: 'erase'; target: string }
  | { op: 'clear' }
  | { op: 'pause'; ms: number };

export type ShapeCommand = Exclude<
  DrawCommand,
  { op: 'highlight' } | { op: 'erase' } | { op: 'clear' } | { op: 'pause' }
>;

/** One beat of a lesson: what the tutor says while it draws. */
export interface LessonStep {
  say: string;
  draw: DrawCommand[];
}

export type Subject = 'Maths' | 'Science' | 'Geography' | 'Physics' | 'Chemistry' | 'Biology' | 'Chat';

/** The question the tutor hands back at the end of a lesson. */
export interface CheckIn {
  question: string;
  /** Tap-to-answer options. Without them the student answers in their own words. */
  choices?: string[];
  answer?: number;
  /** Said when the student picks the right answer. */
  praise?: string;
  /** Said when they pick a wrong one; they can try again. */
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  steps: LessonStep[];
  checkIn?: CheckIn;
}

/** An element that currently lives on the board. */
export interface BoardElement {
  key: number;
  cmd: ShapeCommand;
}

/**
 * Colours are theme tokens, not hex values. Each board theme (chalkboard,
 * graph paper, blueprint, ...) maps them to its own palette, so the same
 * lesson looks right on every board.
 */
export const INK = {
  dark: 'var(--ink)',
  blue: 'var(--ink-blue)',
  red: 'var(--ink-red)',
  green: 'var(--ink-green)',
  orange: 'var(--ink-orange)',
  purple: 'var(--ink-purple)',
  brown: 'var(--ink-brown)',
  gray: 'var(--ink-gray)',
  onNight: 'var(--ink-on-night)',
  // fills
  yellow: 'var(--fill-yellow)',
  sun: 'var(--fill-sun)',
  sky: 'var(--fill-sky)',
  leaf: 'var(--fill-leaf)',
  pink: 'var(--fill-pink)',
  salmon: 'var(--fill-salmon)',
  night: 'var(--fill-night)',
  cloud: 'var(--fill-cloud)',
} as const;
