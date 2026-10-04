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

export interface Lesson {
  id: string;
  title: string;
  subject: 'Maths' | 'Science' | 'Geography' | 'Chat';
  steps: LessonStep[];
  /** Question the tutor hands back to the student at the end. */
  checkIn?: string;
}

/** An element that currently lives on the board. */
export interface BoardElement {
  key: number;
  cmd: ShapeCommand;
}

export const INK = {
  dark: '#1f2937',
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  orange: '#ea580c',
  purple: '#7c3aed',
  brown: '#92400e',
  gray: '#6b7280',
  // fills
  yellow: '#fde68a',
  sun: '#fde047',
  sky: '#bfdbfe',
  leaf: '#bbf7d0',
  pink: '#fbcfe8',
  salmon: '#fca5a5',
  night: '#1e3a8a',
  cloud: '#f3f4f6',
} as const;
