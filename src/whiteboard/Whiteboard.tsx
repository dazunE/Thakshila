import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { arrowPath, defaultDuration, wedgePath } from './geometry';
import { BOARD_HEIGHT, BOARD_WIDTH, INK, type BoardElement, type Pt, type ShapeCommand } from './types';

interface Props {
  elements: BoardElement[];
  highlighted: Set<string>;
  cursor: Pt | null;
  penActive: boolean;
  /** Strokes the student drew themselves. */
  studentStrokes: Pt[][];
  onStudentStroke: (stroke: Pt[]) => void;
}

export function Whiteboard({ elements, highlighted, cursor, penActive, studentStrokes, onStudentStroke }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [liveStroke, setLiveStroke] = useState<Pt[] | null>(null);

  const toBoard = (e: ReactPointerEvent): Pt => {
    const svg = svgRef.current!;
    const box = svg.getBoundingClientRect();
    // viewBox uses "meet", so scale is uniform and content is centred
    const scale = Math.min(box.width / BOARD_WIDTH, box.height / BOARD_HEIGHT);
    const offX = (box.width - BOARD_WIDTH * scale) / 2;
    const offY = (box.height - BOARD_HEIGHT * scale) / 2;
    return [(e.clientX - box.left - offX) / scale, (e.clientY - box.top - offY) / scale];
  };

  return (
    <svg
      ref={svgRef}
      className={`board-svg${penActive ? ' pen-on' : ''}`}
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Tutor whiteboard"
      onPointerDown={(e) => {
        if (!penActive) return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setLiveStroke([toBoard(e)]);
      }}
      onPointerMove={(e) => {
        if (!liveStroke) return;
        setLiveStroke([...liveStroke, toBoard(e)]);
      }}
      onPointerUp={() => {
        if (liveStroke && liveStroke.length > 1) onStudentStroke(liveStroke);
        setLiveStroke(null);
      }}
    >
      <defs>
        {/* slight wobble so strokes feel hand drawn */}
        <filter id="handdrawn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>

      <g filter="url(#handdrawn)">
        {elements.map((el) => (
          <Shape key={el.key} cmd={el.cmd} highlighted={!!el.cmd.id && highlighted.has(el.cmd.id)} />
        ))}
      </g>

      <g className="student-ink">
        {[...studentStrokes, ...(liveStroke ? [liveStroke] : [])].map((s, i) => (
          <polyline key={i} points={s.map((p) => p.join(',')).join(' ')} />
        ))}
      </g>

      {cursor && (
        <g className="tutor-pencil" style={{ transform: `translate(${cursor[0]}px, ${cursor[1]}px)` }}>
          <text x={4} y={-4} fontSize={34}>
            ✏️
          </text>
        </g>
      )}
    </svg>
  );
}

function Shape({ cmd, highlighted }: { cmd: ShapeCommand; highlighted: boolean }) {
  const duration = cmd.duration ?? defaultDuration(cmd);
  const color = cmd.color ?? INK.dark;
  const width = cmd.width ?? 4;
  const cls = `shape${highlighted ? ' hl' : ''}`;
  const style = { '--d': `${duration}ms`, opacity: cmd.opacity } as CSSProperties;

  const stroke = {
    stroke: color,
    strokeWidth: width,
    pathLength: 1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (cmd.op) {
    case 'line':
      return (
        <g className={cls} style={style}>
          <line x1={cmd.from[0]} y1={cmd.from[1]} x2={cmd.to[0]} y2={cmd.to[1]} {...stroke}
            className={cmd.dashed ? 'fade' : 'draw'} strokeDasharray={cmd.dashed ? '10 10' : undefined} pathLength={cmd.dashed ? undefined : 1} />
        </g>
      );
    case 'arrow':
      return (
        <g className={cls} style={style}>
          <path d={arrowPath(cmd.from, cmd.to, cmd.curve)} fill="none" {...stroke} className="draw" />
        </g>
      );
    case 'circle':
      return (
        <g className={cls} style={style}>
          <circle cx={cmd.center[0]} cy={cmd.center[1]} r={cmd.r} fill={cmd.fill ?? 'none'} {...stroke}
            className={cmd.fill ? 'draw filled' : 'draw'} />
        </g>
      );
    case 'rect':
      return (
        <g className={cls} style={style}>
          <rect x={cmd.at[0]} y={cmd.at[1]} width={cmd.size[0]} height={cmd.size[1]} rx={cmd.radius ?? 0}
            fill={cmd.fill ?? 'none'} {...stroke} className={cmd.fill ? 'draw filled' : 'draw'} />
        </g>
      );
    case 'wedge':
      return (
        <g className={cls} style={style}>
          <path d={wedgePath(cmd.center, cmd.r, cmd.fromDeg, cmd.toDeg)} fill={cmd.fill ?? 'none'} {...stroke}
            className={cmd.fill ? 'draw filled' : 'draw'} />
        </g>
      );
    case 'path':
      return (
        <g className={cls} style={style}>
          <path d={cmd.d} fill={cmd.fill ?? 'none'} {...stroke} className={cmd.fill ? 'draw filled' : 'draw'} />
        </g>
      );
    case 'text':
      return (
        <g className={cls} style={style}>
          <TypedText cmd={cmd} duration={duration} color={color} />
        </g>
      );
    case 'emoji':
      return (
        <g className={cls} style={style}>
          <text x={cmd.at[0]} y={cmd.at[1]} fontSize={cmd.size ?? 40} textAnchor="middle" dominantBaseline="middle" className="pop">
            {cmd.char}
          </text>
        </g>
      );
  }
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
      dominantBaseline="middle" fill={color} className="board-text">
      {cmd.text.slice(0, shown)}
    </text>
  );
}
