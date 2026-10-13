import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Scale, Users, Utensils, LogIn, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import HomeHero from '@/components/dashboard/HomeHero';
import EventsBand from '@/components/dashboard/EventsBand';
import SpeakButton from '@/components/common/SpeakButton';

const SECTIONS = [
  { to: '/legal', icon: Scale, title: 'legal.title', summary: 'legal.subtitle' },
  { to: '/community', icon: Users, title: 'community.title', summary: 'community.subtitle' },
  { to: '/food', icon: Utensils, title: 'food.title', summary: 'food.subtitle' },
];

/** Public home for people browsing before they create an account. */
export default function GuestHome() {
  const { t } = usePrefs();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let active = true;
    base44.entities.Event.filter({ event_date: { $gte: today } }, { sort: 'event_date', limit: 12 }).then((page) => {
      if (active) setEvents(page.items);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rt-page -mx-4 -mt-5 sm:-mx-6 lg:-mt-8">
      <HomeHero />

      <div className="rt-in">
        <header>
          <h1 className="rt-title">{t('guest.title')}</h1>
          <p className="rt-sub">{t('guest.subtitle')}</p>
          <SpeakButton text={`${t('guest.title')}. ${t('guest.subtitle')}`} className="rt-listen" />
        </header>

        <div className="rt-cta-row">
          <Link to="/register" className="rt-cta">
            <UserPlus aria-hidden="true" />
            {t('nav.signUp')}
          </Link>
          <Link to="/login" className="rt-cta rt-cta-2">
            <LogIn aria-hidden="true" />
            {t('nav.signIn')}
          </Link>
        </div>

        <section aria-labelledby="guest-explore">
          <h2 id="guest-explore" className="rt-quick">
            {t('guest.explore')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {SECTIONS.map(({ to, icon: Icon, title, summary }) => (
              <Link key={to} to={to} className="rt-card block transition-transform hover:-translate-y-0.5">
                <h3>
                  <Icon aria-hidden="true" />
                  {t(title)}
                </h3>
                <p className="rt-p">{t(summary)}</p>
              </Link>
            ))}
          </div>
        </section>

        {events.length ? <EventsBand events={events} /> : null}
      </div>
    </div>
  );
}