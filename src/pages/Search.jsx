import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, MoveRight } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import PageHeader from '@/components/common/PageHeader';
import { matchSections, runSearch } from '@/lib/search';

export default function Search() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated } = useAccountAction();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [input, setInput] = useState(query);
  const [groups, setGroups] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('q') || '';
    setQuery(next);
    setInput(next);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setGroups([]);
      setSections([]);
      return;
    }
    setGroups(null);
    setSections(matchSections(query, t));
    let active = true;
    runSearch(query, t, { includePersonal: isAuthenticated }).then((result) => {
      if (active) setGroups(result);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, query, t]);

  const submit = (event) => {
    event.preventDefault();
    const term = input.trim();
    window.history.replaceState(null, '', term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    setQuery(term);
  };

  const total = (groups || []).reduce((sum, group) => sum + group.items.length, 0) + sections.length;
  const isLoading = !!query.trim() && groups === null;
  const useEnglish = prefs.contentLang === 'en';

  return (
    <div>
      <PageHeader title={t('search.title')} subtitle={t('search.subtitle')} icon={SearchIcon} />

      <form role="search" onSubmit={submit} className="mb-6">
        <label className="sr-only" htmlFor="search-page-input">
          {t('search.placeholder')}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="search-page-input"
            type="search"
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('search.placeholder')}
            className="r-tap w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-3 text-base focus-visible:outline-none"
          />
        </div>
      </form>

      {!query.trim() ? (
        <div className="r-card text-center">
          <SearchIcon className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{t('search.start')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('search.hint')}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
          <p className="text-center text-sm text-muted-foreground">{t('search.loading')}</p>
        </div>
      ) : total === 0 ? (
        <div className="r-card text-center">
          <p className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">{t('search.empty')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('search.emptyHelp')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-muted-foreground">
            {total} {t('search.results')}
          </p>

          {sections.length ? (
            <section aria-labelledby="search-sections">
              <h2 id="search-sections" className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-teal))]">
                {t('search.sections')}
              </h2>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    to={section.to}
                    className="r-tap flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 hover:bg-secondary"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-teal))]">
                      <section.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="font-semibold text-foreground">{section.title}</span>
                    <MoveRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {(groups || []).map((group) => (
            <section key={group.key} aria-labelledby={`search-${group.key}`}>
              <h2 id={`search-${group.key}`} className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-teal))]">
                {group.label}
              </h2>
              <ul className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className="r-tap block rounded-2xl border border-border bg-card px-4 py-3 hover:bg-secondary"
                    >
                      <p className="font-semibold text-foreground">
                        {useEnglish && item.titleEn ? item.titleEn : item.title}
                      </p>
                      {item.subtitle ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {useEnglish && item.subtitleEn ? item.subtitleEn : item.subtitle}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}