export type OwlMood = 'idle' | 'talking' | 'listening' | 'thinking' | 'cheer';

/**
 * Professor Hoot. Pure SVG + CSS so it stays crisp and light:
 * blinks while idle, moves the beak while talking, tilts its head to listen,
 * looks up while thinking, jumps when the student gets something right, and
 * points its wing at the board while explaining.
 */
export function OwlTeacher({ mood, size = 150 }: { mood: OwlMood; size?: number }) {
  return (
    <svg className={`owl owl-${mood}`} viewBox="0 0 160 180" width={size} height={(size * 180) / 160} aria-hidden>
      <g className="owl-all">
        {/* feet */}
        <path d="M60 164 l-6 10 M64 165 v10 M68 164 l6 10" className="owl-feet" />
        <path d="M92 164 l-6 10 M96 165 v10 M100 164 l6 10" className="owl-feet" />

        {/* left wing (static) */}
        <ellipse cx="32" cy="112" rx="16" ry="38" className="owl-wing" transform="rotate(14 32 112)" />
        {/* right wing: raises to point at the board */}
        <g className="owl-point">
          <ellipse cx="128" cy="112" rx="16" ry="38" className="owl-wing" transform="rotate(-14 128 112)" />
        </g>

        {/* body */}
        <ellipse cx="80" cy="112" rx="52" ry="58" className="owl-body" />
        <ellipse cx="80" cy="124" rx="34" ry="40" className="owl-belly" />
        <path d="M62 112 q6 6 12 0 q6 6 12 0 q6 6 12 0 M56 128 q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0 M62 144 q6 6 12 0 q6 6 12 0 q6 6 12 0" className="owl-scallop" />

        <g className="owl-head">
          {/* ear tufts */}
          <path d="M34 62 L40 30 L58 52 Z" className="owl-body" />
          <path d="M126 62 L120 30 L102 52 Z" className="owl-body" />
          <ellipse cx="80" cy="74" rx="50" ry="40" className="owl-body" />
          <path d="M44 74 q36 -24 72 0 q-4 30 -36 34 q-32 -4 -36 -34 z" className="owl-face" />

          {/* eyes */}
          <g className="owl-eyes">
            <circle cx="60" cy="74" r="17" className="owl-eye" />
            <circle cx="100" cy="74" r="17" className="owl-eye" />
            <g className="owl-pupils">
              <circle cx="62" cy="76" r="8" className="owl-pupil" />
              <circle cx="102" cy="76" r="8" className="owl-pupil" />
              <circle cx="65" cy="72" r="2.6" className="owl-glint" />
              <circle cx="105" cy="72" r="2.6" className="owl-glint" />
            </g>
            <g className="owl-lids">
              <ellipse cx="60" cy="74" rx="18" ry="18" className="owl-lid" />
              <ellipse cx="100" cy="74" rx="18" ry="18" className="owl-lid" />
            </g>
          </g>
          {/* glasses */}
          <circle cx="60" cy="74" r="20" className="owl-glasses" />
          <circle cx="100" cy="74" r="20" className="owl-glasses" />
          <path d="M78 70 h4" className="owl-glasses" />

          {/* beak: the lower half drops while talking */}
          <path d="M72 92 L88 92 L80 102 Z" className="owl-beak" />
          <path d="M73 100 L87 100 L80 108 Z" className="owl-beak owl-beak-low" />

          {/* cheeks */}
          <ellipse cx="44" cy="96" rx="7" ry="4" className="owl-cheek" />
          <ellipse cx="116" cy="96" rx="7" ry="4" className="owl-cheek" />

          {/* graduation cap */}
          <path d="M40 34 L80 18 L120 34 L80 50 Z" className="owl-cap" />
          <path d="M58 40 v12 q22 10 44 0 v-12" className="owl-cap" />
          <g className="owl-tassel">
            <path d="M80 34 L112 40 L112 60" className="owl-tassel-cord" />
            <path d="M108 58 h8 l-1 10 h-6 z" className="owl-tassel-end" />
          </g>
        </g>
      </g>
    </svg>
  );
}
