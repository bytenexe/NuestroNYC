import React from 'react';
import { BadgeCheck, ExternalLink, Megaphone } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { formatDate } from '@/lib/readiness';
import Speakable from '@/components/common/Speakable';

const CATEGORY_STYLE = {
  policy: 'bg-[hsl(var(--brand-navy))] text-white',
  clinic: 'bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]',
  aid: 'bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]',
  resource: 'bg-muted text-foreground',
};

export default function AlertCard({ alert }) {
  const { t, prefs } = usePrefs();
  const title = prefs.contentLang === 'en' ? alert.title_en || alert.title_es : alert.title_es;
  const body = prefs.contentLang === 'en' ? alert.body_en || alert.body_es : alert.body_es;

  return (
    <Speakable as="article" className="r-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`r-chip ${CATEGORY_STYLE[alert.category] || CATEGORY_STYLE.resource}`}>
          <Megaphone className="h-3 w-3" aria-hidden="true" /> {t(`alert.${alert.category}`)}
        </span>
        {alert.verified ? (
          <span className="r-chip bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" /> {t('community.verifiedSource')}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 font-heading text-base font-bold leading-snug">{title}</h3>
      {body ? <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{body}</p> : null}

      <p className="mt-3 text-xs font-semibold text-muted-foreground">
        {alert.source_org}
        {alert.published_date ? ` · ${t('community.published')} ${formatDate(alert.published_date, prefs.lang)}` : ''}
      </p>

      {alert.link ? (
        <a
          href={alert.link}
          target="_blank"
          rel="noreferrer noopener"
          className="r-link mt-3 text-sm"
        >
          {t('community.register')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </Speakable>
  );
}