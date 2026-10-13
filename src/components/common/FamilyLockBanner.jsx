import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, MoveRight } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function FamilyLockBanner({ count }) {
  const { t } = usePrefs();

  if (!count) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] p-4 text-[hsl(var(--brand-navy))] sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm font-semibold">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t('family.lockBanner').replace('{count}', String(count))}
      </p>
      <Link
        to="/settings"
        className="r-tap r-chip shrink-0 justify-center border border-[hsl(var(--brand-teal))] bg-card font-bold text-[hsl(var(--brand-navy))]"
      >
        {t('family.lockBannerAction')}
        <MoveRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}