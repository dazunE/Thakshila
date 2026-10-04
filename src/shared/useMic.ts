import { useRef, useState } from 'react';
import { listen, stopSpeaking, type ListenError } from '../voice/speech';

/** Push-to-talk: tap to start, tap again (or pause talking) to send. */
export function useMic(onFinal: (text: string) => void, onStart?: () => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<ListenError | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const toggle = () => {
    if (listening) {
      stopRef.current?.();
      return;
    }
    stopSpeaking(); // don't let the tutor hear itself
    onStart?.();
    setError(null);
    setInterim('');
    setListening(true);
    stopRef.current = listen(setInterim, (text, err) => {
      setListening(false);
      setInterim('');
      stopRef.current = null;
      if (text) onFinal(text);
      else if (err) setError(err);
    });
  };

  return { listening, interim, error, clearError: () => setError(null), toggle };
}
