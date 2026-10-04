import type { CSSProperties } from 'react';

/** A short burst of stars/sparks over the board when a check-in is answered right. */
export function Burst({ glyphs }: { glyphs: string[] }) {
  return (
    <div className="burst" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => {
        const angle = (i / 26) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 120 + ((i * 37) % 160);
        const style = {
          '--x': `${Math.cos(angle) * dist}px`,
          '--y': `${Math.sin(angle) * dist}px`,
          '--r': `${(i * 47) % 360}deg`,
          animationDelay: `${(i % 5) * 40}ms`,
        } as CSSProperties;
        return (
          <span key={i} style={style}>
            {glyphs[i % glyphs.length]}
          </span>
        );
      })}
    </div>
  );
}
