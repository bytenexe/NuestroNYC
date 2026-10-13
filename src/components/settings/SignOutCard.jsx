import React from 'react';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';

export default function SignOutCard() {
  const { t } = usePrefs();

  return (
    <section className="r-card space-y-3" aria-labelledby="signout-title">
      <h2 id="signout-title" className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
        {t('settings.signOut')}
      </h2>
      <p className="text-sm text-muted-foreground">{t('settings.signOutHelp')}</p>
      <button
        type="button"
        onClick={() => base44.auth.logout('/login')}
        className="r-tap flex w-full items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--brand-navy))] px-4 font-bold text-[hsl(var(--brand-navy))] hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" /> {t('settings.signOut')}
      </button>
    </section>
  );
}