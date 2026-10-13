import React from 'react';
import { Globe } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function LanguageCard() {
  const { t, prefs, update, languages } = usePrefs();

  return (
    <section className="r-card" aria-labelledby="language-title">
      <h2 id="language-title" className="flex items-center gap-2 font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
        <Globe className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('settings.language')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('settings.languageHelp')}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {languages.map(({ code, label }) => {
          const isActive = prefs.lang === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => update({ lang: code })}
              aria-pressed={isActive}
              className={`r-tap rounded-2xl border-2 px-4 py-3 text-base font-bold transition-colors ${
                isActive
                  ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}