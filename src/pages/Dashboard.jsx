import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { collectDeadlines, computeReadiness } from '@/lib/readiness';
import HomeHero from '@/components/dashboard/HomeHero';
import QuickOrbit from '@/components/dashboard/QuickOrbit';
import ReadinessDial from '@/components/dashboard/ReadinessDial';
import ReadinessFacts from '@/components/dashboard/ReadinessFacts';
import DeadlineBand from '@/components/dashboard/DeadlineBand';
import JourneyBand from '@/components/dashboard/JourneyBand';
import AskBand from '@/components/dashboard/AskBand';
import SavedBand from '@/components/dashboard/SavedBand';
import EventsBand from '@/components/dashboard/EventsBand';
import SpeakButton from '@/components/common/SpeakButton';
import GuestHome from '@/components/dashboard/GuestHome';
import { useAuth } from '@/lib/AuthContext';

export default function Dashboard() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated } = useAuth();
  const code = prefs.householdCode;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    const today = format(new Date(), 'yyyy-MM-dd');

    async function load() {
      const [docs, milestones, contacts, plans, reminders, saved, events] = await Promise.all([
        base44.entities.Document.filter({ household_code: code }, { sort: 'expiry_date', limit: 100 }),
        base44.entities.JourneyMilestone.filter({ household_code: code }, { sort: 'order_index', limit: 50 }),
        base44.entities.TrustedContact.filter({ household_code: code }, { limit: 50 }),
        base44.entities.EmergencyPlan.filter({ household_code: code }, { limit: 1 }),
        base44.entities.Reminder.filter({ household_code: code, status: 'pending' }, { sort: 'due_date', limit: 20 }),
        base44.entities.SavedResource.filter({ household_code: code }, { sort: '-created_date', limit: 8 }),
        base44.entities.Event.filter({ event_date: { $gte: today } }, { sort: 'event_date', limit: 12 }),
      ]);
      if (!active) return;
      setData({
        documents: docs.items,
        milestones: milestones.items,
        contacts: contacts.items,
        plan: plans.items[0] || null,
        reminders: reminders.items,
        saved: saved.items,
        events: events.items,
      });
    }

    load();
    return () => {
      active = false;
    };
  }, [code, isAuthenticated]);

  if (!isAuthenticated) {
    return <GuestHome />;
  }

  if (!data) {
    return (
      <div className="rt-page -mx-4 -mt-5 sm:-mx-6 lg:-mt-8" aria-busy="true" aria-live="polite">
        <div className="rt-in">
          <div className="h-52 animate-pulse rounded-3xl bg-[#efe4d5]" />
          <div className="rt-dm">
            {[0, 1].map((key) => (
              <div key={key} className="rt-card h-32 animate-pulse bg-[#f5efe5]" />
            ))}
          </div>
          <p className="rt-sm mt-4 text-center">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const readiness = computeReadiness({
    documents: data.documents,
    milestones: data.milestones,
    contacts: data.contacts,
    plan: data.plan,
    savedCount: data.saved.length,
  });
  const deadlines = collectDeadlines({ documents: data.documents, reminders: data.reminders });
  const name = prefs.displayName?.trim();
  const greeting = name ? `${t('dash.hello')}, ${name}` : t('dash.helloGuest');

  return (
    <div className="rt-page -mx-4 -mt-5 sm:-mx-6 lg:-mt-8">
      <HomeHero />

      <div className="rt-in">
        <header>
          <h1 className="rt-title">{greeting}</h1>
          <p className="rt-sub">{t('dash.subtitle')}</p>
          <SpeakButton text={`${greeting}. ${t('dash.subtitle')}`} className="rt-listen" />
        </header>

        <QuickOrbit>
          <ReadinessDial score={readiness.score} />
        </QuickOrbit>

        <ReadinessFacts
          completed={readiness.completed}
          missing={readiness.missing}
          recommendations={readiness.recommendations}
        />

        <DeadlineBand deadlines={deadlines} />
        <JourneyBand milestones={data.milestones} />
        <AskBand />
        <SavedBand saved={data.saved} />
        <EventsBand events={data.events} />
      </div>
    </div>
  );
}