import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAuth } from '@/lib/AuthContext';
import { NAV_ITEMS } from '@/components/nav/navItems';

export default function SideNav() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated } = useAuth();

  return (
    <aside
      aria-label={t('nav.main')}
      className="r-gradient fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col px-5 py-7 lg:flex"
    >
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--brand-orange))] font-heading text-xl font-extrabold text-[hsl(var(--brand-navy-deep))]">
          N
        </span>
        <span className="leading-tight text-white">
          <span className="block font-heading text-base font-extrabold tracking-tight">NuestroNYC</span>
          <span className="block text-[11px] font-medium text-white/70">{t('nav.main') === 'Home' ? 'Immigrant readiness' : 'Preparación migratoria'}</span>
        </span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `r-tap flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold transition-colors ${
                isActive
                  ? 'bg-white text-[hsl(var(--brand-navy))]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      {isAuthenticated ? (
        <div className="mt-6 rounded-2xl bg-white/10 p-4 text-white">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t('settings.familyCode')}
          </p>
          <p className="mt-1 font-mono text-sm font-bold">{prefs.householdCode}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          <Link
            to="/register"
            className="r-tap flex items-center justify-center gap-2 rounded-2xl bg-white font-bold text-[hsl(var(--brand-navy))]"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" /> {t('nav.signUp')}
          </Link>
          <Link
            to="/login"
            className="r-tap flex items-center justify-center gap-2 rounded-2xl border border-white/40 font-semibold text-white hover:bg-white/10"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" /> {t('nav.signIn')}
          </Link>
        </div>
      )}
    </aside>
  );
}