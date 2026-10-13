import React from 'react';
import { Map as MapIcon, Building2, Landmark, Trees, TreePine, Ship } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { BOROUGHS } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

export const BOROUGH_ICONS = {
  all: MapIcon,
  queens: Trees,
  bronx: TreePine,
  brooklyn: Landmark,
  manhattan: Building2,
  staten_island: Ship,
};

export default function BoroughFilter({ value, onChange, label }) {
  const { t } = usePrefs();
  const options = ['all', ...BOROUGHS];

  return (
    <Speakable className="mb-4" controls>
      <div className="r-scroll-x" role="group" aria-label={label}>
      {options.map((option) => {
        const Icon = BOROUGH_ICONS[option];
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={`r-tap r-chip shrink-0 border font-bold ${
              active
                ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                : 'border-border bg-card'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option === 'all' ? t('common.all') : t(`borough.${option}`)}
          </button>
        );
      })}
      </div>
    </Speakable>
  );
}