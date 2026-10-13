import React from 'react';
import { BadgeCheck, CreditCard, Globe, MapPin, Phone, Map as MapIcon } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { FOOD_TYPE_KEYS } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

function hasLocation(site) {
  return typeof site.lat === 'number' && typeof site.lng === 'number';
}

export default function FoodCard({ site, onShowOnMap }) {
  const { t, prefs } = usePrefs();
  const description = prefs.lang === 'en' ? site.description_en || site.description_es : site.description_es;

  return (
    <Speakable as="article" className="r-card flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-bold leading-snug">{site.name}</h3>
        {site.verified ? (
          <span className="r-chip shrink-0 bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]" title={site.verification_source}>
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.verified')}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {FOOD_TYPE_KEYS[site.org_type] ? (
          <span className="r-chip bg-muted text-foreground">{t(FOOD_TYPE_KEYS[site.org_type])}</span>
        ) : null}
        {site.accepts_snap ? (
          <span className="r-chip bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]">
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> {t('food.acceptsSnap')}
          </span>
        ) : null}
      </div>

      {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}

      {site.address ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
          <span>{site.address}</span>
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {site.phone ? (
          <a
            href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}
            className="r-chip border border-border bg-card hover:bg-secondary"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {site.phone}
          </a>
        ) : null}
        {hasLocation(site) ? (
          <button type="button" onClick={onShowOnMap} className="r-chip border border-border bg-card hover:bg-secondary">
            <MapIcon className="h-3.5 w-3.5" aria-hidden="true" /> {t('food.showOnMap')}
          </button>
        ) : null}
        {site.website ? (
          <a href={site.website} target="_blank" rel="noreferrer noopener" className="r-link text-sm">
            {t('common.website')} <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </Speakable>
  );
}