import React from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, LogIn } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAuth } from '@/lib/AuthContext';
import LanguageToggle from '@/components/common/LanguageToggle';
import PathwayNav from '@/components/nav/PathwayNav';
import SearchInput from '@/components/search/SearchInput';

export default function TopBar() {
  const { t } = usePrefs();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label={t('app.name')}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--brand-navy))] font-heading text-base font-extrabold text-[hsl(var(--brand-orange))]">
            N
          </span>
          <span className="font-heading text-sm font-extrabold leading-tight text-[hsl(var(--brand-navy))]">
            Nuestro
            <span className="block text-[10px] font-semibold text-muted-foreground">NYC</span>
          </span>
        </Link>

        <p className="hidden max-w-md text-sm font-medium text-muted-foreground lg:block">{t('app.tagline')}</p>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/settings"
            className="r-tap flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] hover:bg-muted"
          >
            <Accessibility className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('settings.accessibility')}</span>
          </Link>
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="r-tap flex items-center gap-2 rounded-2xl bg-[hsl(var(--brand-navy))] px-3 py-2 text-sm font-semibold text-white hover:bg-[hsl(var(--brand-navy-deep))]"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('nav.signIn')}</span>
            </Link>
          ) : null}
        </div>

        <SearchInput className="order-last w-full sm:order-none sm:w-64 lg:w-80" />
      </div>

      <PathwayNav />
    </header>
  );
}