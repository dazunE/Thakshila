/**
 * Shows a sentence with the words already spoken marked, so early readers
 * can follow the voice word by word.
 */
export function ReadAlong({ text, spokenChars }: { text: string; spokenChars: number | null }) {
  if (spokenChars === null) return <>{text}</>;
  const parts = text.split(/(\s+)/);
  let pos = 0;
  return (
    <>
      {parts.map((part, i) => {
        const start = pos;
        pos += part.length;
        if (/^\s+$/.test(part)) return part;
        const state = pos <= spokenChars ? 'said' : start <= spokenChars ? 'now' : 'next';
        return (
          <span key={i} className={`word ${state}`}>
            {part}
          </span>
        );
      })}
    </>
  );
}
