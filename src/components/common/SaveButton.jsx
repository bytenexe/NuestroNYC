import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function SaveButton({ saved, onToggle, className = '' }) {
  const { t } = usePrefs();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!!saved}
      className={`r-chip border transition-colors ${
        saved
          ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
          : 'border-border bg-card text-muted-foreground hover:text-foreground'
      } ${className}`}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {saved ? t('legal.savedOrg') : t('legal.saveOrg')}
    </button>
  );
}