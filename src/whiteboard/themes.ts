import type { Subject } from './types';

/**
 * Board looks. The kids' classroom always uses the chalkboard; the high-school
 * board changes its material to suit the subject being taught.
 * Colours live in styles (`.theme-<id>`); this file holds what code needs.
 */
export type BoardThemeId = 'chalk' | 'graph' | 'blueprint' | 'lab' | 'sketch';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  /** SVG filter that gives strokes their material: chalk dust, pencil grain, … */
  filter: 'chalk' | 'pencil' | 'wobble' | 'none';
  /** What the tutor holds while drawing. */
  tool: 'chalk' | 'pencil' | 'pen';
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  chalk: { id: 'chalk', name: 'Chalkboard', filter: 'chalk', tool: 'chalk' },
  graph: { id: 'graph', name: 'Graph paper', filter: 'wobble', tool: 'pen' },
  blueprint: { id: 'blueprint', name: 'Blueprint', filter: 'none', tool: 'pen' },
  lab: { id: 'lab', name: 'Lab notebook', filter: 'wobble', tool: 'pen' },
  sketch: { id: 'sketch', name: 'Sketchbook', filter: 'pencil', tool: 'pencil' },
};

/** High-school mode: each subject gets its own board. */
export function teenThemeFor(subject: Subject): BoardThemeId {
  switch (subject) {
    case 'Physics':
      return 'blueprint';
    case 'Chemistry':
      return 'lab';
    case 'Biology':
      return 'sketch';
    default:
      return 'graph';
  }
}
