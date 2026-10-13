import React from 'react';
import { Accessibility, Type, Eye, BookOpen, Volume2, Bell } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Switch } from '@/components/ui/switch';

export default function AccessibilityPanel() {
  const { t, prefs, update } = usePrefs();

  const toggles = [
    { key: 'dyslexia', label: t('settings.dyslexia'), help: t('settings.dyslexiaHelp'), icon: BookOpen },
    { key: 'highContrast', label: t('settings.contrast'), help: t('settings.contrastHelp'), icon: Eye },
    { key: 'visualNotifications', label: t('settings.visual'), help: t('settings.visualHelp'), icon: Bell },
    { key: 'readAloud', label: t('settings.readAloud'), help: t('settings.readAloudHelp'), icon: Volume2 },
  ];

  return (
    <section className="r-card space-y-4" aria-labelledby="a11y-title">
      <div>
        <h2 id="a11y-title" className="flex items-center gap-2 font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
          <Accessibility className="h-5 w-5 text-[hsl(var(--brand-orange))]" aria-hidden="true" /> {t('settings.accessibility')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings.accessibilityHelp')}</p>
      </div>

      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Type className="h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('settings.fontsize')}
        </p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('settings.fontsize')}>
          {[
            { value: 'normal', label: t('settings.fontNormal') },
            { value: 'large', label: t('settings.fontLarge') },
            { value: 'xlarge', label: t('settings.fontXLarge') },
          ].map((option) => {
            const active = prefs.fontsize === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ fontsize: option.value })}
                aria-pressed={active}
                className={`r-tap rounded-2xl border-2 px-3 py-2.5 text-sm font-bold ${
                  active
                    ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {toggles.map(({ key, label, help, icon: Icon }) => (
          <li key={key} className="flex items-center justify-between gap-4 py-3">
            <span className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-xs text-muted-foreground">{help}</span>
              </span>
            </span>
            <Switch
              checked={!!prefs[key]}
              onCheckedChange={(checked) => update({ [key]: !!checked })}
              aria-label={label}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}