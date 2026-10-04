import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { arrowPath, defaultDuration, wedgePath } from './geometry';
import type { BoardTheme } from './themes';
import { BOARD_HEIGHT, BOARD_WIDTH, INK, type BoardElement, type Pt, type ShapeCommand } from './types';

interface Props {
  theme: BoardTheme;
  elements: BoardElement[];
  highlighted: Set<string>;
  cursor: Pt | null;
  penActive: boolean;
  /** Strokes the student drew themselves. */
  studentStrokes: Pt[][];
  onStudentStroke: (stroke: Pt[]) => void;
}

export function Whiteboard({ theme, elements, highlighted, cursor, penActive, studentStrokes, onStudentStroke }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [liveStroke, setLiveStroke] = useState<Pt[] | null>(null);

  const toBoard = (e: ReactPointerEvent): Pt => {
    const box = svgRef.current!.getBoundingClientRect();
    // viewBox uses "meet", so scale is uniform and content is centred
    const scale = Math.min(box.width / BOARD_WIDTH, box.height / BOARD_HEIGHT);
    const offX = (box.width - BOARD_WIDTH * scale) / 2;
    const offY = (box.height - BOARD_HEIGHT * scale) / 2;
    return [(e.clientX - box.left - offX) / scale, (e.clientY - box.top - offY) / scale];
  };

  const filter = theme.filter === 'none' ? undefined : `url(#f-${theme.filter})`;

  return (
    <svg
      ref={svgRef}
      className={`board-svg${penActive ? ' pen-on' : ''}`}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${theme.name} with the tutor's drawing`}
      onPointerDown={(e) => {
        if (!penActive) return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setLiveStroke([toBoard(e)]);
      }}
      onPointerMove={(e) => {
        if (liveStroke) setLiveStroke([...liveStroke, toBoard(e)]);
      }}
      onPointerUp={() => {
        if (liveStroke && liveStroke.length > 1) onStudentStroke(liveStroke);
        setLiveStroke(null);
      }}
    >
      <defs>
        <filter id="f-wobble" filterUnits="userSpaceOnUse" x="0" y="0" width={BOARD_WIDTH} height={BOARD_HEIGHT}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        {/* chalk: punch a fine dusty grain into the strokes, then roughen the edges */}
        <filter id="f-chalk" filterUnits="userSpaceOnUse" x="0" y="0" width={BOARD_WIDTH} height={BOARD_HEIGHT}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -0.6" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="dusty" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="2" result="warp" />
          <feDisplacementMap in="dusty" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* pencil: lighter grain, like graphite on paper */}
        <filter id="f-pencil" filterUnits="userSpaceOnUse" x="0" y="0" width={BOARD_WIDTH} height={BOARD_HEIGHT}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -0.1" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap in="soft" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter={filter}>
        {elements.map((el) => (
          <Shape key={el.key} cmd={el.cmd} highlighted={!!el.cmd.id && highlighted.has(el.cmd.id)} />
        ))}
      </g>

      <g className="student-ink" filter={filter}>
        {[...studentStrokes, ...(liveStroke ? [liveStroke] : [])].map((s, i) => (
          <polyline key={i} points={s.map((p) => p.join(',')).join(' ')} />
        ))}
      </g>

      {cursor && <TutorTool tool={theme.tool} at={cursor} />}
    </svg>
  );
}

/** The chalk stick / pencil / pen that follows the tutor's drawing. */
function TutorTool({ tool, at }: { tool: BoardTheme['tool']; at: Pt }) {
  return (
    <g className="tutor-tool" style={{ transform: `translate(${at[0]}px, ${at[1]}px)` }}>
      <g transform="rotate(-35)">
        {tool === 'chalk' ? (
          <>
            <rect x={-7} y={-62} width={14} height={60} rx={5} className="tool-body" />
            <rect x={-7} y={-62} width={14} height={14} rx={5} className="tool-cap" />
          </>
        ) : (
          <>
            <path d="M-7 -70 h14 v52 l-7 18 l-7 -18 Z" className="tool-body" />
            <path d="M-7 -18 l7 18 l7 -18 Z" className="tool-tip" />
            <rect x={-7} y={-70} width={14} height={10} className="tool-cap" />
          </>
        )}
      </g>
    </g>
  );
}

function Shape({ cmd, highlighted }: { cmd: ShapeCommand; highlighted: boolean }) {
  const duration = cmd.duration ?? defaultDuration(cmd);
  const color = cmd.color ?? INK.dark;
  const width = cmd.width ?? 4;
  const cls = `shape${highlighted ? ' hl' : ''}`;
  const groupStyle = { '--d': `${duration}ms`, opacity: cmd.opacity } as CSSProperties;

  // Colours are CSS variables, so they go in `style` rather than SVG attributes.
  const strokeStyle = (fill?: string): CSSProperties => ({
    stroke: color,
    // chalk is chunkier than a pen; each theme can scale every stroke
    strokeWidth: `calc(${width}px * var(--stroke-scale, 1))`,
    fill: fill ?? 'none',
  });
  const common = { pathLength: 1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const drawCls = (fill?: string) => (fill ? 'draw filled' : 'draw');

  let body: JSX.Element;
  switch (cmd.op) {
    case 'line':
      body = cmd.dashed ? (
        <line x1={cmd.from[0]} y1={cmd.from[1]} x2={cmd.to[0]} y2={cmd.to[1]} style={strokeStyle()}
          strokeLinecap="round" strokeDasharray="10 12" className="fade" />
      ) : (
        <line x1={cmd.from[0]} y1={cmd.from[1]} x2={cmd.to[0]} y2={cmd.to[1]} style={strokeStyle()} {...common} className="draw" />
      );
      break;
    case 'arrow':
      body = <path d={arrowPath(cmd.from, cmd.to, cmd.curve)} style={strokeStyle()} {...common} className="draw" />;
      break;
    case 'circle':
      body = <circle cx={cmd.center[0]} cy={cmd.center[1]} r={cmd.r} style={strokeStyle(cmd.fill)} {...common} className={drawCls(cmd.fill)} />;
      break;
    case 'rect':
      body = (
        <rect x={cmd.at[0]} y={cmd.at[1]} width={cmd.size[0]} height={cmd.size[1]} rx={cmd.radius ?? 0}
          style={strokeStyle(cmd.fill)} {...common} className={drawCls(cmd.fill)} />
      );
      break;
    case 'wedge':
      body = (
        <path d={wedgePath(cmd.center, cmd.r, cmd.fromDeg, cmd.toDeg)} style={strokeStyle(cmd.fill)} {...common}
          className={drawCls(cmd.fill)} />
      );
      break;
    case 'path':
      body = <path d={cmd.d} style={strokeStyle(cmd.fill)} {...common} className={drawCls(cmd.fill)} />;
      break;
    case 'text':
      body = <TypedText cmd={cmd} duration={duration} color={color} />;
      break;
    case 'emoji':
      body = (
        <text x={cmd.at[0]} y={cmd.at[1]} fontSize={cmd.size ?? 40} textAnchor="middle" dominantBaseline="middle" className="pop">
          {cmd.char}
        </text>
      );
      break;
  }
  return (
    <g className={cls} style={groupStyle}>
      {body}
    </g>
  );
}

/** Text appears letter by letter, as if written. */
function TypedText({ cmd, duration, color }: { cmd: Extract<ShapeCommand, { op: 'text' }>; duration: number; color: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const total = cmd.text.length;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const n = Math.min(total, Math.ceil(((now - start) / duration) * total));
      setShown(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cmd.text, duration]);

  return (
    <text x={cmd.at[0]} y={cmd.at[1]} fontSize={cmd.size ?? 32} textAnchor={cmd.anchor ?? 'middle'}
      dominantBaseline="middle" style={{ fill: color }} className="board-text">
      {cmd.text.slice(0, shown)}
    </text>
  );
}
