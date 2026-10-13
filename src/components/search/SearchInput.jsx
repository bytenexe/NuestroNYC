import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function SearchInput({ className = '' }) {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const term = value.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <form role="search" onSubmit={submit} className={className}>
      <label className="sr-only" htmlFor="app-search">
        {t('search.placeholder')}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="app-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('search.placeholder')}
          className="r-tap w-full rounded-full border-2 border-[hsl(var(--brand-navy))] bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>
    </form>
  );
}