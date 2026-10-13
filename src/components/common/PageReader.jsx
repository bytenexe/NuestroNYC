import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, Square } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { collectReadableText } from '@/lib/readText';
import { speakLong, stopSpeech } from '@/lib/speech';

/** Floating control that reads every line of text on the current page or open dialog. */
export default function PageReader() {
  const { t, prefs } = usePrefs();
  const { pathname } = useLocation();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  useEffect(() => {
    stopSpeech();
    setSpeaking(false);
  }, [pathname]);

  if (!prefs.readAloud) return null;

  const toggle = async () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    const root =
      document.querySelector('[role="dialog"][data-state="open"]') || document.getElementById('main');
    const text = collectReadableText(root, { includeControls: true });
    if (!text) return;
    setSpeaking(true);
    await speakLong(text, prefs.lang, { onDone: () => setSpeaking(false) });
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:bottom-6 lg:right-6" data-speak-skip="true">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={speaking}
        className="r-tap flex items-center gap-2 rounded-full bg-[hsl(var(--brand-navy))] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[hsl(var(--brand-navy-deep))]"
      >
        {speaking ? <Square className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        {speaking ? t('common.stop') : t('page.readAloud')}
      </button>
    </div>
  );
}