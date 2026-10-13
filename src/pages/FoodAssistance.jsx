import React, { useEffect, useState } from 'react';
import { Utensils, Search, List, Map as MapIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { FOOD_TYPE_KEYS } from '@/lib/constants';
import PageHeader from '@/components/common/PageHeader';
import BoroughFilter from '@/components/common/BoroughFilter';
import FoodTypeFilter from '@/components/food/FoodTypeFilter';
import FoodCard from '@/components/food/FoodCard';
import MapExplorer from '@/components/map/MapExplorer';

export default function FoodAssistance() {
  const { t, prefs } = usePrefs();
  const [type, setType] = useState('all');
  const [borough, setBorough] = useState('all');
  const [view, setView] = useState('list');
  const [sites, setSites] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const query = {};
    if (type !== 'all') query.org_type = type;
    if (borough !== 'all') query.boroughs = borough;

    let active = true;
    setSites(null);
    base44.entities.FoodResource.filter(query, { sort: 'name', limit: 100 }).then((page) => {
      if (active) setSites(page.items);
    });
    return () => {
      active = false;
    };
  }, [type, borough]);

  const typeLabel = (siteType) => (FOOD_TYPE_KEYS[siteType] ? t(FOOD_TYPE_KEYS[siteType]) : siteType);
  const siteName = (site) => site.name;
  const sitePlace = (site) => site.address || (site.boroughs?.[0] ? t(`borough.${site.boroughs[0]}`) : '');
  const siteSummary = (site) => [typeLabel(site.org_type), site.accepts_snap ? t('food.acceptsSnap') : null];
  const siteDetails = (site) => {
    const description = prefs.contentLang === 'en' ? site.description_en || site.description_es : site.description_es;
    return [
      typeLabel(site.org_type),
      site.accepts_snap ? t('food.acceptsSnap') : null,
      site.hours ? `${t('common.hours')}: ${site.hours}` : null,
      description,
    ];
  };
  const siteActions = (site) => {
    const actions = [];
    if (site.phone) actions.push({ href: `tel:${site.phone.replace(/[^\d+]/g, '')}`, label: site.phone, icon: 'phone' });
    if (site.website) actions.push({ href: site.website, label: t('common.website'), icon: 'site' });
    return actions;
  };

  const viewToggle = (
    <div className="mb-4 flex gap-2" role="group" aria-label={t('food.viewGroup')}>
      <button
        type="button"
        onClick={() => setView('list')}
        aria-pressed={view === 'list'}
        className={`r-tap r-chip border font-bold ${
          view === 'list'
            ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
            : 'border-border bg-card'
        }`}
      >
        <List className="h-4 w-4" aria-hidden="true" /> {t('common.viewList')}
      </button>
      <button
        type="button"
        onClick={() => setView('map')}
        aria-pressed={view === 'map'}
        className={`r-tap r-chip border font-bold ${
          view === 'map'
            ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
            : 'border-border bg-card'
        }`}
      >
        <MapIcon className="h-4 w-4" aria-hidden="true" /> {t('common.viewMap')}
      </button>
    </div>
  );

  return (
    <div>
      <PageHeader title={t('food.title')} subtitle={t('food.subtitle')} icon={Utensils} />

      <FoodTypeFilter value={type} onChange={setType} />
      <BoroughFilter value={borough} onChange={setBorough} label={t('food.boroughFilter')} />
      {viewToggle}

      {sites === null ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : view === 'map' ? (
        <MapExplorer
          records={sites}
          selectedId={selectedId}
          onSelect={setSelectedId}
          titleOf={siteName}
          subtitleOf={sitePlace}
          summaryOf={siteSummary}
          detailsOf={siteDetails}
          actionsOf={siteActions}
          labels={{
            listTitle: t('food.mapListTitle'),
            hint: t('food.mapHint'),
            empty: t('food.mapEmpty'),
            select: t('food.mapSelect'),
            focused: t('food.mapFocused'),
            noLocation: t('food.noLocation'),
            note: t('food.mapNote'),
          }}
        />
      ) : sites.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <FoodCard
              key={site.id}
              site={site}
              onShowOnMap={() => {
                setSelectedId(site.id);
                setView('map');
              }}
            />
          ))}
        </div>
      ) : (
        <div className="r-card text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{t('food.empty')}</p>
        </div>
      )}
    </div>
  );
}