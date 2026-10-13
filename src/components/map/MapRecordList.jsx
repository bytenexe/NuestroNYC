import React from 'react';
import { MapPin, MapPinOff } from 'lucide-react';

function hasCoords(record) {
  return typeof record.lat === 'number' && typeof record.lng === 'number';
}

export default function MapRecordList({ records, selectedId, onSelect, titleOf, subtitleOf, labels }) {
  return (
    <section className="r-card overflow-hidden p-0" aria-label={labels.listTitle}>
      <h2 className="border-b border-border px-4 py-3 font-heading text-sm font-extrabold text-[hsl(var(--brand-navy))]">
        {labels.listTitle}
      </h2>
      <ul className="max-h-[360px] divide-y divide-border overflow-y-auto lg:max-h-[430px]">
        {records.map((record) => {
          const located = hasCoords(record);
          const active = record.id === selectedId;
          const subtitle = subtitleOf(record);
          return (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => onSelect(record.id)}
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
                  <span className="block text-sm font-bold text-foreground">{titleOf(record)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {subtitle || labels.noLocation}
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