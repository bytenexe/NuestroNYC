import React from 'react';
import { BadgeCheck, MapPin, Globe, Map as MapIcon } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { tLabel } from '@/lib/constants';
import SaveButton from '@/components/common/SaveButton';
import Speakable from '@/components/common/Speakable';
import ProviderDialog from '@/components/resources/ProviderDialog';

function costLabel(t, cost) {
  if (cost === 'free') return t('common.costFree');
  if (cost === 'sliding_scale') return t('common.costSliding');
  if (cost === 'affordable') return t('common.costAffordable');
  return t('common.costPaid');
}

function hasLocation(provider) {
  return typeof provider.lat === 'number' && typeof provider.lng === 'number';
}

export default function ProviderCard({ provider, saved, onToggleSave, onShowOnMap }) {
  const { t, prefs } = usePrefs();
  const description = prefs.contentLang === 'en' ? provider.description_en || provider.description_es : provider.description_es;

  return (
    <Speakable as="article" className="r-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-bold leading-snug text-foreground">{provider.name}</h3>
          {provider.verified ? (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--brand-teal))]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('legal.verifiedBy')}
            </p>
          ) : null}
        </div>
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>

      {description ? <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p> : null}

      {provider.address ? (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
          <span>{provider.address}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <span className="r-chip bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]">{costLabel(t, provider.cost)}</span>
        {(provider.boroughs || []).slice(0, 2).map((borough) => (
          <span key={borough} className="r-chip bg-muted text-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" /> {t(`borough.${borough}`)}
          </span>
        ))}
        {(provider.languages || []).slice(0, 2).map((language) => (
          <span key={language} className="r-chip bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]">
            {language}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <ProviderDialog provider={provider} />
        {hasLocation(provider) ? (
          <button type="button" onClick={onShowOnMap} className="r-chip border border-border bg-card hover:bg-secondary">
            <MapIcon className="h-3.5 w-3.5" aria-hidden="true" /> {t('legal.showOnMap')}
          </button>
        ) : null}
        {provider.website ? (
          <a
            href={provider.website}
            target="_blank"
            rel="noreferrer noopener"
            className="r-chip border border-border bg-card hover:bg-secondary"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.website')}
          </a>
        ) : null}
      </div>
    </Speakable>
  );
}