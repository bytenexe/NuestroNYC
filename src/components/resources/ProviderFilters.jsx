import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOROUGHS, COST_TYPES, MODALITIES, SERVICE_TYPES } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

const LANGUAGES = ['Español', 'English', 'Español/English'];

export default function ProviderFilters({ value, onChange, resultCount }) {
  const { t } = usePrefs();

  const field = (key, label, options, render) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground" htmlFor={`filter-${key}`}>
        {label}
      </label>
      <Select value={value[key]} onValueChange={(next) => onChange({ ...value, [key]: next })}>
        <SelectTrigger id={`filter-${key}`} className="r-tap bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {render(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Speakable as="section" aria-label={t('common.search')} className="r-card mb-5" controls>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {field('borough', t('legal.filterBorough'), BOROUGHS, (option) => t(`borough.${option}`))}
        {field('language', t('legal.filterLanguage'), LANGUAGES, (option) => option)}
        {field('cost', t('legal.filterCost'), COST_TYPES, (option) =>
          option === 'free'
            ? t('common.costFree')
            : option === 'sliding_scale'
            ? t('common.costSliding')
            : option === 'affordable'
            ? t('common.costAffordable')
            : t('common.costPaid')
        )}
        {field('service', t('legal.filterService'), SERVICE_TYPES, (option) => t(`legal.service.${option}`))}
        {field('modality', t('legal.filterModality'), MODALITIES, (option) =>
          option === 'in_person' ? t('common.inPerson') : option === 'virtual' ? t('common.virtual') : t('common.both')
        )}
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm font-bold text-[hsl(var(--brand-navy))]">
            {resultCount ?? '—'} {t('legal.results')}
          </p>
          <button
            type="button"
            onClick={() => onChange({ borough: 'all', language: 'all', cost: 'all', service: 'all', modality: 'all' })}
            className="r-chip border border-border bg-card hover:bg-secondary"
          >
            {t('common.all')}
          </button>
        </div>
      </div>
    </Speakable>
  );
}