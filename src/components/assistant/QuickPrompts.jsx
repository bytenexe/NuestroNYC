import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function QuickPrompts({ onPick, disabled }) {
  const { t } = usePrefs();
  const prompts = [t('luz.q1'), t('luz.q2'), t('luz.q3'), t('luz.q4'), t('luz.q5')];

  return (
    <section aria-labelledby="quick-prompts-title">
      <h2 id="quick-prompts-title" className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t('luz.quickTitle')}
      </h2>
      <div className="r-scroll-x pb-1">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPick(prompt)}
            className="r-tap shrink-0 rounded-2xl border border-border bg-card px-4 py-2.5 text-left text-sm font-semibold hover:border-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-soft))] disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}