import React, { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { speakLong, stopSpeech } from '@/lib/speech';

export default function SpeakButton({ text, label, className = '' }) {
  const { prefs, t } = usePrefs();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  if (!prefs.readAloud) return null;

  const toggle = async () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    const value = String(typeof text === 'function' ? text() : text || '').trim();
    if (!value) return;
    setSpeaking(true);
    await speakLong(value, prefs.lang, { onDone: () => setSpeaking(false) });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      data-speak-skip="true"
      className={`r-chip border border-border bg-card text-foreground hover:bg-secondary ${className}`}
    >
      {speaking ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />}
      {speaking ? t('common.stop') : label || t('common.listen')}
    </button>
  );
}