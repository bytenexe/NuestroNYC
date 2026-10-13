import React, { useCallback, useEffect, useState } from 'react';
import { Scale, Search, List, Map as MapIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/common/PageHeader';
import ProviderCard from '@/components/resources/ProviderCard';
import ProviderFilters from '@/components/resources/ProviderFilters';
import ProvidersMap from '@/components/resources/ProvidersMap';

const EMPTY_FILTERS = { borough: 'all', language: 'all', cost: 'all', service: 'all', modality: 'all' };

export default function Resources() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const code = prefs.householdCode;
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [providers, setProviders] = useState(null);
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);

  const loadSaved = useCallback(async () => {
    if (!isAuthenticated) {
      setSaved([]);
      return;
    }
    const page = await base44.entities.SavedResource.filter(
      { household_code: code, item_type: 'legal_provider' },
      { limit: 100 }
    );
    setSaved(page.items);
  }, [code, isAuthenticated]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useEffect(() => {
    const query = {};
    if (filters.borough !== 'all') query.boroughs = filters.borough;
    if (filters.language !== 'all') query.languages = filters.language;
    if (filters.cost !== 'all') query.cost = filters.cost;
    if (filters.service !== 'all') query.services = filters.service;
    if (filters.modality !== 'all') query.modality = { $in: [filters.modality, 'both'] };

    let active = true;
    base44.entities.LegalProvider.filter(query, { sort: 'name', limit: 100 }).then((page) => {
      if (active) setProviders(page.items);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  const toggleSave = async (provider, existing) => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    if (existing) {
      await base44.entities.SavedResource.delete(existing.id);
    } else {
      await base44.entities.SavedResource.create({
        household_code: code,
        item_type: 'legal_provider',
        item_id: provider.id,
        name: provider.name,
        subtitle: provider.boroughs?.[0] ? t(`borough.${provider.boroughs[0]}`) : '',
      });
    }
    loadSaved();
  };

  return (
    <div>
      <PageHeader title={t('legal.title')} subtitle={t('legal.subtitle')} icon={Scale} />

      <ProviderFilters value={filters} onChange={setFilters} resultCount={providers?.length} />

      {providers !== null ? (
        <div className="mb-5 flex gap-2" role="group" aria-label={t('legal.viewGroup')}>
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
            <List className="h-4 w-4" aria-hidden="true" /> {t('legal.viewList')}
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
            <MapIcon className="h-4 w-4" aria-hidden="true" /> {t('legal.viewMap')}
          </button>
        </div>
      ) : null}

      {providers === null ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-52 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : view === 'map' ? (
        <ProvidersMap providers={providers} selectedId={selectedId} onSelect={setSelectedId} />
      ) : providers.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {providers.map((provider) => {
            const existing = saved.find((item) => item.item_id === provider.id);
            return (
              <ProviderCard
                key={provider.id}
                provider={provider}
                saved={!!existing}
                onToggleSave={() => toggleSave(provider, existing)}
                onShowOnMap={() => {
                  setSelectedId(provider.id);
                  setView('map');
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="r-card text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{t('legal.empty')}</p>
        </div>
      )}
    </div>
  );
}