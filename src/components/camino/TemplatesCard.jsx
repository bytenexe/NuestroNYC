import React, { useState } from 'react';
import { Route, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { JOURNEY_TEMPLATES, tLabel } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

export default function TemplatesCard({ onUse, defaultOpen }) {
  const { t, prefs } = usePrefs();
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <Speakable as="section" className="r-card" aria-labelledby="templates-title" controls>
      <h2 id="templates-title" className="flex items-center gap-2 font-heading text-base font-extrabold text-[hsl(var(--brand-navy))]">
        <Route className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('camino.templates')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('camino.templatesHelp')}</p>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="r-tap r-chip mt-3 border border-border bg-muted font-bold text-[hsl(var(--brand-navy))]"
      >
        {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        {open ? t('camino.hideTemplates') : t('camino.showTemplates')}
      </button>

      {open ? (
        <ul className="mt-3 space-y-3">
          {JOURNEY_TEMPLATES.map((template) => (
            <li key={template.id} className="rounded-2xl border border-border p-3.5">
              <p className="font-heading text-sm font-bold text-foreground">{tLabel(template.name, prefs.contentLang)}</p>
              <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                {template.milestones.map((step) => (
                  <li key={step.en}>• {tLabel(step, prefs.contentLang)}</li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => onUse(template)}
                className="r-tap r-chip mt-3 border border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] font-bold text-[hsl(var(--brand-navy))]"
              >
                {t('camino.useTemplate')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Speakable>
  );
}