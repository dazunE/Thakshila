import type { DrawCommand, Pt } from './types';

const rad = (deg: number) => (deg * Math.PI) / 180;

export function polar(center: Pt, r: number, deg: number): Pt {
  return [center[0] + r * Math.cos(rad(deg)), center[1] + r * Math.sin(rad(deg))];
}

export function wedgePath(center: Pt, r: number, fromDeg: number, toDeg: number): string {
  const [x0, y0] = polar(center, r, fromDeg);
  const [x1, y1] = polar(center, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  const sweep = toDeg > fromDeg ? 1 : 0;
  return `M${center[0]} ${center[1]} L${x0} ${y0} A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1} Z`;
}

/** Shaft plus arrow head as a single path, so it can be "drawn" in one stroke. */
export function arrowPath(from: Pt, to: Pt, curve = 0): string {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  // control point offset perpendicular to the direction of travel
  const cx = (x0 + x1) / 2 + (dy / len) * curve * len;
  const cy = (y0 + y1) / 2 + (-dx / len) * curve * len;
  // head direction follows the tangent at the end of the curve
  const tx = x1 - cx;
  const ty = y1 - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const head = Math.min(18, len / 3);
  const spread = 0.5;
  const h1: Pt = [x1 - head * (ux * Math.cos(spread) - uy * Math.sin(spread)), y1 - head * (uy * Math.cos(spread) + ux * Math.sin(spread))];
  const h2: Pt = [x1 - head * (ux * Math.cos(spread) + uy * Math.sin(spread)), y1 - head * (uy * Math.cos(spread) - ux * Math.sin(spread))];
  const shaft = curve ? `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}` : `M${x0} ${y0} L${x1} ${y1}`;
  return `${shaft} M${h1[0]} ${h1[1]} L${x1} ${y1} L${h2[0]} ${h2[1]}`;
}

/** Where the tutor's pencil should rest after drawing a command. */
export function anchorOf(cmd: DrawCommand): Pt | null {
  switch (cmd.op) {
    case 'line':
    case 'arrow':
      return cmd.to;
    case 'circle':
      return [cmd.center[0] + cmd.r, cmd.center[1]];
    case 'rect':
      return [cmd.at[0] + cmd.size[0], cmd.at[1] + cmd.size[1]];
    case 'wedge':
      return polar(cmd.center, cmd.r, cmd.toDeg);
    case 'text':
    case 'emoji':
      return cmd.at;
    case 'path': {
      const nums = cmd.d.match(/-?\d+(\.\d+)?/g);
      if (!nums || nums.length < 2) return null;
      return [Number(nums[nums.length - 2]), Number(nums[nums.length - 1])];
    }
    default:
      return null;
  }
}

/** Default drawing time when a command doesn't specify one. */
export function defaultDuration(cmd: DrawCommand): number {
  switch (cmd.op) {
    case 'text':
      return Math.min(1600, 250 + cmd.text.length * 45);
    case 'emoji':
      return 300;
    case 'line':
    case 'arrow':
      return 500;
    case 'pause':
      return cmd.ms;
    case 'highlight':
    case 'erase':
    case 'clear':
      return 250;
    default:
      return 700;
  }
}
