import { useEffect, useRef, useState } from 'react';
import { canSpeak, onVoices, speak, type VoiceSettings } from '../voice/speech';

interface Props {
  voiceOn: boolean;
  setVoiceOn: (on: boolean) => void;
  settings: VoiceSettings;
  setSettings: (s: VoiceSettings) => void;
  sample: string;
  /** Wording for the kids' version ("for grown-ups"). */
  kids?: boolean;
}

/** Sound on/off plus a small popover to pick the voice and speed. */
export function VoicePanel({ voiceOn, setVoiceOn, settings, setSettings, sample, kids }: Props) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => onVoices(setVoices), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const test = () => {
    const ctrl = new AbortController();
    void speak(sample, settings, ctrl.signal);
  };

  return (
    <div className="voice-panel" ref={ref}>
      <button
        className={`vp-toggle${voiceOn ? ' on' : ''}`}
        onClick={() => setVoiceOn(!voiceOn)}
        disabled={!canSpeak}
        aria-pressed={voiceOn}
        title={canSpeak ? (voiceOn ? 'Turn voice off' : 'Turn voice on') : 'This browser cannot speak'}
      >
        <SpeakerIcon on={voiceOn} />
        <span>{voiceOn ? 'Voice on' : 'Voice off'}</span>
      </button>
      <button className="vp-more" onClick={() => setOpen(!open)} aria-expanded={open} title="Voice settings">
        <GearIcon />
      </button>
      {open && (
        <div className="vp-pop" role="dialog" aria-label="Voice settings">
          <p className="vp-title">{kids ? 'Voice settings (for grown-ups)' : 'Voice settings'}</p>
          <label htmlFor="vp-voice">Voice</label>
          <select
            id="vp-voice"
            value={settings.voiceURI}
            onChange={(e) => setSettings({ ...settings, voiceURI: e.target.value })}
          >
            <option value="">Automatic (best available)</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <label htmlFor="vp-rate">Speed: {settings.rate.toFixed(2)}×</label>
          <input
            id="vp-rate"
            type="range"
            min={0.7}
            max={1.3}
            step={0.05}
            value={settings.rate}
            onChange={(e) => setSettings({ ...settings, rate: Number(e.target.value) })}
          />
          <button className="vp-test" onClick={test} disabled={!canSpeak}>
            Test voice
          </button>
          {!canSpeak && <p className="vp-note">This browser has no built-in voices. Try Chrome, Edge or Safari.</p>}
          {canSpeak && voices.length === 0 && <p className="vp-note">No English voices found yet. They may still be loading.</p>}
        </div>
      )}
    </div>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? (
        <>
          <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" />
        </>
      ) : (
        <path d="M17 9l5 6M22 9l-5 6" />
      )}
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function MicIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
