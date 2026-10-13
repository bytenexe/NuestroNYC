import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MoreHorizontal, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { usePrefs } from '@/lib/PreferencesContext';
import { NAV_ITEMS } from '@/components/nav/navItems';

export default function MobileNav() {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const primary = NAV_ITEMS.filter((i) => i.primary);
  const rest = NAV_ITEMS.filter((i) => !i.primary);

  const itemClass = ({ isActive }) =>
    `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold ${
      isActive ? 'text-[hsl(var(--brand-teal))]' : 'text-muted-foreground'
    }`;

  return (
    <>
      <nav
        aria-label={t('nav.main')}
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur lg:hidden"
      >
        {primary.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={itemClass} aria-label={t(key)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="max-w-full truncate">{t(key).split(' ')[0]}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setOpen(true)} className={itemClass({ isActive: false })} aria-label={t('nav.more')}>
          <MoreHorizontal className="h-6 w-6" aria-hidden="true" />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bottom-0 top-auto max-w-lg translate-y-0 rounded-b-none rounded-t-3xl p-5 lg:hidden">
          <DialogTitle className="text-base">{t('nav.more')}</DialogTitle>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {rest.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="r-tap flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3 font-semibold text-secondary-foreground"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t(key)}
              </NavLink>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="r-tap mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-muted font-semibold"
          >
            <X className="h-4 w-4" aria-hidden="true" /> {t('common.close')}
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}