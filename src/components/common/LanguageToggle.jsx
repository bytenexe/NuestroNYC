import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';

const SHORT = { es: 'ES', en: 'EN', fr: 'FR', pt: 'PT' };

export default function LanguageToggle() {
  const { prefs, update, languages } = usePrefs();

  return (
    <div role="group" aria-label="Language / Idioma" className="flex rounded-2xl border border-border bg-muted p-1">
      {languages.map(({ code }) => {
        const label = SHORT[code];
        const active = prefs.lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => update({ lang: code })}
            aria-pressed={active}
            className={`min-h-[36px] rounded-xl px-3 text-sm font-bold transition-colors ${
              active ? 'bg-[hsl(var(--brand-navy))] text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}