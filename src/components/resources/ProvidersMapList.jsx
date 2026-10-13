import React from 'react';
import { MapPin, MapPinOff } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

function hasLocation(provider) {
  return typeof provider.lat === 'number' && typeof provider.lng === 'number';
}

export default function ProvidersMapList({ providers, selectedId, onSelect }) {
  const { t } = usePrefs();

  return (
    <section className="r-card overflow-hidden p-0" aria-label={t('legal.mapListTitle')}>
      <h2 className="border-b border-border px-4 py-3 font-heading text-sm font-extrabold text-[hsl(var(--brand-navy))]">
        {t('legal.mapListTitle')}
      </h2>
      <ul className="max-h-[360px] divide-y divide-border overflow-y-auto lg:max-h-[430px]">
        {providers.map((provider) => {
          const located = hasLocation(provider);
          const active = provider.id === selectedId;
          return (
            <li key={provider.id}>
              <button
                type="button"
                onClick={() => onSelect(provider.id)}
                aria-pressed={active}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                  active ? 'bg-[hsl(var(--brand-teal-soft))]' : 'hover:bg-muted/70'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    located ? 'bg-[hsl(var(--brand-teal))] text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {located ? (
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <MapPinOff className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{provider.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {located && provider.address ? provider.address : t('legal.mapNoLocation')}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}