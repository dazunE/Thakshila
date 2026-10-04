export type BuddyMood = 'idle' | 'talking' | 'listening' | 'thinking' | 'cheer';

/**
 * Chalky: a living stick of chalk, the thing that draws on the board.
 * Pure SVG + CSS: bobs and blinks while idle, talks with an open mouth and
 * points at the board while explaining, cups a hand to its ear while
 * listening, looks up with thought bubbles while thinking, and jumps with
 * both arms up (in a puff of chalk dust) when the child gets it right.
 */
export function ChalkBuddy({ mood, size = 150 }: { mood: BuddyMood; size?: number }) {
  return (
    <svg className={`ck ck-${mood}`} viewBox="0 0 160 180" width={size} height={(size * 180) / 160} aria-hidden>
      <ellipse cx="80" cy="171" rx="30" ry="5" className="ck-shadow" />

      <g className="ck-all">
        {/* legs and sneakers */}
        <path d="M68 144 v16 M92 144 v16" className="ck-line" />
        <ellipse cx="64" cy="163" rx="10" ry="5.5" className="ck-shoe" />
        <ellipse cx="96" cy="163" rx="10" ry="5.5" className="ck-shoe" />

        {/* the chalk stick, dipped in yellow at the top */}
        <rect x="52" y="28" width="56" height="120" rx="24" className="ck-body" />
        <path d="M52 54 V52 A24 24 0 0 1 76 28 H84 A24 24 0 0 1 108 52 V54 Z" className="ck-cap" />
        <path d="M52 54 q7 5 14 0 t14 0 t14 0 t14 0" className="ck-cap-edge" />
        <rect x="52" y="28" width="56" height="120" rx="24" className="ck-outline" />
        <circle cx="61" cy="126" r="2" className="ck-speck" />
        <circle cx="97" cy="133" r="1.6" className="ck-speck" />
        <circle cx="72" cy="139" r="1.8" className="ck-speck" />
        <circle cx="99" cy="118" r="1.3" className="ck-speck" />

        {/* arms: the right one points at the board, the left one goes to the ear */}
        <g className="ck-arm-l">
          <path d="M53 100 q-16 6 -22 22" className="ck-line" />
          <circle cx="31" cy="122" r="6" className="ck-hand" />
        </g>
        <g className="ck-arm-r">
          <path d="M107 100 q16 6 22 22" className="ck-line" />
          <circle cx="129" cy="122" r="6" className="ck-hand" />
        </g>

        {/* face */}
        <path d="M62 67 q7 -5 13 0 M85 67 q7 -5 13 0" className="ck-brow" />
        <g className="ck-pupils">
          <ellipse cx="69" cy="80" rx="6" ry="8" className="ck-eye" />
          <ellipse cx="91" cy="80" rx="6" ry="8" className="ck-eye" />
          <circle cx="71" cy="77" r="2.2" className="ck-glint" />
          <circle cx="93" cy="77" r="2.2" className="ck-glint" />
        </g>
        <g className="ck-lids">
          <ellipse cx="69" cy="80" rx="8" ry="10" className="ck-lid" />
          <ellipse cx="91" cy="80" rx="8" ry="10" className="ck-lid" />
        </g>
        <ellipse cx="60" cy="96" rx="6" ry="3.5" className="ck-cheek" />
        <ellipse cx="100" cy="96" rx="6" ry="3.5" className="ck-cheek" />
        <path d="M71 97 q9 9 18 0" className="ck-smile" />
        <ellipse cx="80" cy="101" rx="7" ry="6" className="ck-mouth" />
      </g>

      {/* thought bubbles (thinking) */}
      <g className="ck-think">
        <circle cx="118" cy="34" r="3" />
        <circle cx="128" cy="22" r="4.5" />
        <circle cx="141" cy="10" r="6" />
      </g>
      {/* chalk-dust puff (cheer) */}
      <g className="ck-dust">
        <circle cx="46" cy="160" r="7" />
        <circle cx="114" cy="160" r="8" />
        <circle cx="34" cy="150" r="5" />
        <circle cx="126" cy="148" r="5" />
      </g>
    </svg>
  );
}
