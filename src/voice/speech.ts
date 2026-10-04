/**
 * Voice in and out with the browser's built-in Web Speech API.
 * No keys or servers needed. In production this can be swapped for a
 * streaming neural TTS/STT provider (docs/CONCEPT.md, "Voice pipeline").
 */

export interface VoiceSettings {
  /** `voiceURI` of the chosen voice, or '' for automatic. */
  voiceURI: string;
  rate: number;
  pitch: number;
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Rough speaking time, used to pace steps when muted and as a safety net. */
export function estimateSpeechMs(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1400, (words * 340) / rate);
}

// ---------- voices ----------

let voices: SpeechSynthesisVoice[] = [];
const voiceListeners = new Set<(v: SpeechSynthesisVoice[]) => void>();

function loadVoices() {
  if (!canSpeak) return;
  voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
  voiceListeners.forEach((fn) => fn(voices));
}
if (canSpeak) {
  loadVoices();
  // Chrome loads voices asynchronously.
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export function onVoices(fn: (v: SpeechSynthesisVoice[]) => void): () => void {
  voiceListeners.add(fn);
  fn(voices);
  return () => voiceListeners.delete(fn);
}

/** Friendly, clear voices first; anything English as a fallback. */
const PREFERRED = [
  'Samantha',
  'Google UK English Female',
  'Microsoft Aria Online',
  'Microsoft Jenny Online',
  'Karen',
  'Moira',
  'Tessa',
  'Google US English',
  'Daniel',
];

function resolveVoice(voiceURI: string): SpeechSynthesisVoice | null {
  if (voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === voiceURI);
    if (chosen) return chosen;
  }
  for (const name of PREFERRED) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.localService) ?? voices[0] ?? null;
}

// ---------- speaking ----------

// Chrome can garbage-collect an utterance mid-sentence, after which `onend`
// never fires. Holding a reference prevents that.
const live = new Set<SpeechSynthesisUtterance>();

/**
 * Speak `text`. Resolves when finished, cancelled, or after a safety timeout.
 * `onWord` receives the character index of each word as it is spoken (when
 * the voice reports word boundaries) for read-along highlighting.
 */
export function speak(
  text: string,
  settings: VoiceSettings,
  signal: AbortSignal,
  onWord?: (charIndex: number) => void,
): Promise<void> {
  if (!canSpeak) return wait(estimateSpeechMs(text, settings.rate), signal);
  const synth = window.speechSynthesis;
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = resolveVoice(settings.voiceURI);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = 'en-US';
    }
    u.rate = settings.rate;
    u.pitch = settings.pitch;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      live.delete(u);
      clearTimeout(timer);
      clearInterval(keepAlive);
      resolve();
    };
    const timer = setTimeout(finish, estimateSpeechMs(text, settings.rate) * 2.5 + 3000);
    // Chrome's online voices stop after ~15 s unless nudged.
    const keepAlive = setInterval(() => {
      if (voice && !voice.localService && synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 10000);

    u.onend = finish;
    u.onerror = finish;
    u.onboundary = (e) => {
      if (e.name === 'word' || e.name === undefined) onWord?.(e.charIndex);
    };
    signal.addEventListener('abort', () => {
      synth.cancel();
      finish();
    });

    live.add(u);
    if (synth.paused) synth.resume();
    synth.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

/**
 * Browsers only allow speech after the user has interacted with the page.
 * Call this inside a click handler to unlock it (needed on iOS Safari).
 */
export function unlockSpeech() {
  if (!canSpeak) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
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

// ---------- listening (the student's voice) ----------

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

const Recognition: (new () => RecognitionLike) | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, new () => RecognitionLike>).SpeechRecognition ??
      (window as unknown as Record<string, new () => RecognitionLike>).webkitSpeechRecognition)
    : undefined;

export const canListen = !!Recognition;

export type ListenError = 'blocked' | 'no-mic' | 'no-speech' | 'offline' | 'unsupported';

/** A sentence a child (or teen) can understand, for each failure. */
export function listenErrorMessage(err: ListenError, kids: boolean): string {
  switch (err) {
    case 'blocked':
      return kids
        ? "I can't hear you on this page. Ask a grown-up to type your question, or tap a picture!"
        : 'Microphone access is blocked on this page. Type your question instead, or run the app locally to talk.';
    case 'no-mic':
      return kids ? "I can't find a microphone. Let's type instead!" : 'No microphone was found. Type your question instead.';
    case 'no-speech':
      return kids ? "I didn't hear anything. Tap the button and try again!" : "Didn't catch that. Tap the mic and try again.";
    case 'offline':
      return kids ? 'My ears need the internet. Try typing instead!' : 'Speech recognition needs an internet connection. Type instead.';
    case 'unsupported':
      return kids
        ? "This browser can't listen. Try typing, or use Chrome!"
        : 'Voice input needs Chrome, Edge or Safari. Type your question instead.';
  }
}

/**
 * Start listening. `onText` gets the running transcript; `onDone` fires once
 * with the final text or an error. Returns a stop function.
 */
export function listen(onText: (t: string) => void, onDone: (text: string, error?: ListenError) => void): () => void {
  if (!Recognition) {
    onDone('', 'unsupported');
    return () => {};
  }
  let rec: RecognitionLike;
  try {
    rec = new Recognition();
  } catch {
    onDone('', 'unsupported');
    return () => {};
  }
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  let transcript = '';
  let error: ListenError | undefined;
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    onDone(transcript.trim(), transcript.trim() ? undefined : error);
  };
  rec.onresult = (e) => {
    transcript = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join('');
    onText(transcript);
  };
  rec.onerror = (e) => {
    error =
      e.error === 'not-allowed' || e.error === 'service-not-allowed'
        ? 'blocked'
        : e.error === 'audio-capture'
          ? 'no-mic'
          : e.error === 'network'
            ? 'offline'
            : 'no-speech';
  };
  rec.onend = done;
  try {
    rec.start();
  } catch {
    error = 'blocked';
    done();
  }
  return () => rec.stop();
}
