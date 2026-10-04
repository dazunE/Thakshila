/**
 * Thin wrappers around the browser Web Speech API.
 * In production these would be swapped for a streaming TTS/STT provider
 * (see docs/CONCEPT.md, "Voice pipeline").
 */

/** Rough reading/speaking time so steps stay paced even when muted. */
export function estimateSpeechMs(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1500, words * 330);
}

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null; // not loaded yet; try again next time
  const prefer = ['Samantha', 'Google UK English Female', 'Google US English', 'Microsoft Aria', 'Karen'];
  cachedVoice =
    prefer.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
  return cachedVoice;
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Speak text; resolves when finished, cancelled, or after a safety timeout. */
export function speak(text: string, signal: AbortSignal): Promise<void> {
  if (!canSpeak) return wait(estimateSpeechMs(text), signal);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = 0.95; // a little slower for young listeners
    u.pitch = 1.1;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, estimateSpeechMs(text) * 2 + 3000);
    u.onend = finish;
    u.onerror = finish;
    signal.addEventListener('abort', () => {
      window.speechSynthesis.cancel();
      finish();
    });
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });
}

// ---- Speech recognition (student's voice) ----

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
};

const Recognition: RecognitionCtor | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, RecognitionCtor | undefined>).SpeechRecognition ??
      (window as unknown as Record<string, RecognitionCtor | undefined>).webkitSpeechRecognition)
    : undefined;

export const canListen = !!Recognition;

/**
 * Start listening. `onText` gets the running transcript; `onDone` fires with the
 * final text when the student stops talking. Returns a stop function.
 */
export function listen(onText: (t: string) => void, onDone: (t: string) => void): () => void {
  if (!Recognition) return () => {};
  const rec = new Recognition();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  let transcript = '';
  rec.onresult = (e) => {
    transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join('');
    onText(transcript);
  };
  rec.onend = () => onDone(transcript);
  rec.onerror = () => onDone(transcript);
  rec.start();
  return () => rec.stop();
}
