import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { formatDate } from '@/lib/readiness';
import Speakable from '@/components/common/Speakable';
import { Image } from '@/components/ui/image';

const EVENTS_IMAGE =
  'https://media.base44.com/images/public/6aca6b70e540702ef09fed45/fde692cfc_generated_423c3e34.jpg';

export default function EventsBand({ events }) {
  const { t, prefs } = usePrefs();

  return (
    <Speakable
      as="section"
      className="rt-band rt-ev rt-R"
      listenClassName="rt-listen"
      aria-labelledby="events-title"
    >
      <h2 id="events-title">
        <CalendarDays aria-hidden="true" />
        {t('dash.eventsTitle')}
      </h2>

      {!events.length ? (
        <p className="rt-p">{t('dash.noEvents')}</p>
      ) : (
        <ul className="rt-list">
          {events.slice(0, 3).map((event) => (
            <li key={event.id} className="rt-pill">
              <Image src={EVENTS_IMAGE} alt="" className="rt-pill-img" />
              <div>
                <b>{prefs.contentLang === 'en' ? event.title_en || event.title_es : event.title_es}</b>
                <span>
                  {formatDate(event.event_date, prefs.lang)}
                  {event.start_time ? ` · ${event.start_time}` : ''}
                  {' · '}
                  {event.borough && event.borough !== 'virtual' ? t(`borough.${event.borough}`) : t('common.virtual')}
                </span>
                {event.org_name ? <span>{event.org_name}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to="/community" className="rt-lk">
        {t('nav.community')} →
      </Link>
    </Speakable>
  );
}