import React from 'react';
import { CalendarDays, Clock, MapPin, ExternalLink, Languages } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { formatDate } from '@/lib/readiness';
import Speakable from '@/components/common/Speakable';

export default function EventCard({ event }) {
  const { t, prefs } = usePrefs();
  const title = prefs.contentLang === 'en' ? event.title_en || event.title_es : event.title_es;
  const description = prefs.contentLang === 'en' ? event.description_en || event.description_es : event.description_es;

  return (
    <Speakable as="article" className="r-card">
      <h3 className="font-heading text-base font-bold leading-snug">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}

      <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
          <dt className="sr-only">{t('common.deadline')}</dt>
          <dd className="font-semibold text-foreground">{formatDate(event.event_date, prefs.lang)}</dd>
        </div>
        {event.start_time ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
            <dd>
              {event.start_time}
              {event.end_time ? ` – ${event.end_time}` : ''}
            </dd>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
          <dd>
            {event.borough && event.borough !== 'virtual' ? t(`borough.${event.borough}`) : t('common.virtual')}
            {event.address ? ` · ${event.address}` : ''}
          </dd>
        </div>
        {event.languages?.length ? (
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
            <dd>{event.languages.join(', ')}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {event.org_name ? <span className="r-chip bg-muted text-foreground">{event.org_name}</span> : null}
        <span className="r-chip bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]">
          {event.cost === 'free' ? t('community.eventFree') : event.cost}
        </span>
        {event.registration_url ? (
          <a href={event.registration_url} target="_blank" rel="noreferrer noopener" className="r-link text-sm">
            {t('community.register')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </Speakable>
  );
}