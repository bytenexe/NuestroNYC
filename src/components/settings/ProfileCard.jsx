import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOROUGHS } from '@/lib/constants';

export default function ProfileCard() {
  const { t, prefs, update } = usePrefs();

  return (
    <section className="r-card space-y-4" aria-labelledby="profile-title">
      <h2 id="profile-title" className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
        {t('settings.profile')}
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="profile-name">{t('settings.name')}</Label>
        <Input
          id="profile-name"
          value={prefs.displayName}
          onChange={(event) => update({ displayName: event.target.value })}
          placeholder={t('settings.namePlaceholder')}
          className="r-tap"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-borough">{t('settings.borough')}</Label>
        <Select value={prefs.borough} onValueChange={(value) => update({ borough: value })}>
          <SelectTrigger id="profile-borough" className="r-tap">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOROUGHS.map((borough) => (
              <SelectItem key={borough} value={borough}>
                {t(`borough.${borough}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('settings.boroughHelp')}</p>
      </div>
    </section>
  );
}