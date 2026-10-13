import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePrefs } from '@/lib/PreferencesContext';
import { NAV_ITEMS } from '@/components/nav/navItems';

export default function PathwayNav() {
  const { t } = usePrefs();

  return (
    <nav aria-label={t('nav.allPaths')} className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="r-scroll-x border-t border-border py-2">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `r-tap r-chip shrink-0 border font-bold ${
                isActive
                  ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {t(key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}