import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Users, Megaphone, CalendarDays, BookOpen, List, Map as MapIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { formatDate } from '@/lib/readiness';
import PageHeader from '@/components/common/PageHeader';
import BoroughFilter from '@/components/common/BoroughFilter';
import MapExplorer from '@/components/map/MapExplorer';
import AlertCard from '@/components/community/AlertCard';
import EventCard from '@/components/community/EventCard';
import GuideDialog from '@/components/community/GuideDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EVENT_VIEWS = [
  { key: 'list', icon: List },
  { key: 'map', icon: MapIcon },
];

export default function Community() {
  const { t, prefs } = usePrefs();
  const [alerts, setAlerts] = useState(null);
  const [events, setEvents] = useState(null);
  const [guides, setGuides] = useState(null);
  const [borough, setBorough] = useState('all');
  const [eventView, setEventView] = useState('list');
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    base44.entities.CommunityAlert.list({ sort: '-published_date', limit: 30 }).then((page) => setAlerts(page.items));
    base44.entities.Resource.list({ sort: 'category', limit: 40 }).then((page) => setGuides(page.items));
  }, []);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const query = { event_date: { $gte: today } };
    if (borough !== 'all') query.borough = { $in: [borough, 'virtual'] };

    let active = true;
    setEvents(null);
    base44.entities.Event.filter(query, { sort: 'event_date', limit: 40 }).then((page) => {
      if (active) setEvents(page.items);
    });
    return () => {
      active = false;
    };
  }, [borough]);

  const eventTitle = (event) => (prefs.contentLang === 'en' ? event.title_en || event.title_es : event.title_es);
  const eventPlace = (event) =>
    event.address || (event.borough === 'virtual' ? t('common.virtual') : t(`borough.${event.borough}`));
  const eventSummary = (event) => [formatDate(event.event_date, prefs.lang)];
  const eventDetails = (event) => [
    formatDate(event.event_date, prefs.lang),
    event.start_time ? (event.end_time ? `${event.start_time} – ${event.end_time}` : event.start_time) : null,
    event.org_name,
    event.cost === 'free' ? t('community.eventFree') : null,
    event.address ? null : t('community.confirmAddress'),
  ];
  const eventActions = (event) =>
    event.registration_url ? [{ href: event.registration_url, label: t('community.register'), icon: 'link' }] : [];

  const loading = (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="h-40 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader title={t('community.title')} subtitle={t('community.subtitle')} icon={Users} />

      <p className="mb-5 rounded-2xl bg-muted p-3.5 text-xs font-semibold text-muted-foreground">{t('community.moderation')}</p>

      <Tabs defaultValue="alerts">
        <TabsList className="r-tap mb-5 grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="alerts" className="gap-1.5 text-sm font-bold">
            <Megaphone className="h-4 w-4" aria-hidden="true" /> {t('community.tabAlerts')}
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 text-sm font-bold">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> {t('community.tabEvents')}
          </TabsTrigger>
          <TabsTrigger value="rights" className="gap-1.5 text-sm font-bold">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> {t('community.tabRights')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          {alerts === null ? (
            loading
          ) : alerts.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <p className="r-card text-center text-sm text-muted-foreground">{t('community.noAlerts')}</p>
          )}
        </TabsContent>

        <TabsContent value="events">
          <BoroughFilter value={borough} onChange={setBorough} label={t('community.boroughFilter')} />

          {events !== null ? (
            <div className="mb-4 flex gap-2" role="group" aria-label={t('community.viewGroup')}>
              {EVENT_VIEWS.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEventView(key)}
                  aria-pressed={eventView === key}
                  className={`r-tap r-chip border font-bold ${
                    eventView === key
                      ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                      : 'border-border bg-card'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {key === 'list' ? t('common.viewList') : t('common.viewMap')}
                </button>
              ))}
            </div>
          ) : null}

          {events === null ? (
            loading
          ) : !events.length ? (
            <p className="r-card text-center text-sm text-muted-foreground">{t('community.noEvents')}</p>
          ) : eventView === 'map' ? (
            <MapExplorer
              records={events}
              selectedId={selectedEventId}
              onSelect={setSelectedEventId}
              titleOf={eventTitle}
              subtitleOf={eventPlace}
              summaryOf={eventSummary}
              detailsOf={eventDetails}
              actionsOf={eventActions}
              labels={{
                listTitle: t('community.mapListTitle'),
                hint: t('community.mapHint'),
                empty: t('community.mapEmpty'),
                select: t('community.mapSelect'),
                focused: t('community.mapFocused'),
                noLocation: t('community.noLocation'),
                note: t('community.mapNote'),
              }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rights">
          {guides === null ? (
            loading
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((resource) => (
                <GuideDialog key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}