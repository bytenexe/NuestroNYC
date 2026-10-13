import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { tLabel } from '@/lib/constants';
import { formatDate } from '@/lib/readiness';
import Speakable from '@/components/common/Speakable';

export default function DeadlineBand({ deadlines, onComplete }) {
  const { t, prefs } = usePrefs();

  return (
    <Speakable
      as="section"
      className="rt-band rt-rib rt-L"
      listenClassName="rt-listen"
      aria-labelledby="alerts-title"
    >
      <h2 id="alerts-title">
        <CalendarClock aria-hidden="true" />
        {t('dash.alertsTitle')}
      </h2>

      {!deadlines.length ? (
        <p className="rt-p rt-al">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          {t('dash.noAlerts')}
        </p>
      ) : (
        <ul className="rt-deadlines">
          {deadlines.slice(0, 5).map((row) => {
            const urgent = row.days <= 30;
            return (
              <li key={row.id} className="rt-deadline">
                <div>
                  <p className="rt-deadline-title">{row.title}</p>
                  <p className="rt-deadline-meta">
                    {tLabel(row.kindLabel, prefs.lang)} · {t('dash.dueOn')} {formatDate(row.date, prefs.lang)}
                  </p>
                </div>
                <span className={`rt-chip ${row.days < 0 ? 'rt-chip-plum' : urgent ? 'rt-chip-mint' : ''}`}>
                  {row.days < 0 ? t('common.expired') : `${row.days} ${t('dash.daysLeft')}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rt-band-links">
        <Link to="/documents" className="rt-lk">
          {t('nav.documents')} →
        </Link>
        {deadlines.length && onComplete ? (
          <button type="button" onClick={() => onComplete(deadlines[0])} className="rt-lk">
            {t('common.done')}
          </button>
        ) : null}
      </div>
    </Speakable>
  );
}