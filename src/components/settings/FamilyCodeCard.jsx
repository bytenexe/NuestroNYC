import React, { useState } from 'react';
import { KeyRound, Copy, Check, DoorOpen, Trash2 } from 'lucide-react';
import { newHouseholdCode, usePrefs } from '@/lib/PreferencesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FamilyCodeCard() {
  const { t, prefs, update } = usePrefs();
  const [joinValue, setJoinValue] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prefs.householdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const join = (event) => {
    event.preventDefault();
    const value = joinValue.trim().toUpperCase();
    if (!/^FAM-[A-Z0-9]{6}$/.test(value)) {
      setError(t('settings.joinError'));
      return;
    }
    update({ householdCode: value });
    setJoinValue('');
    setError('');
  };

  const clearData = () => {
    update({
      displayName: '',
      householdCode: newHouseholdCode(),
      dyslexia: false,
      highContrast: false,
      visualNotifications: false,
      fontsize: 'normal',
    });
  };

  return (
    <section className="r-card space-y-4" aria-labelledby="code-title">
      <div>
        <h2 id="code-title" className="flex items-center gap-2 font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
          <KeyRound className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('settings.familyCode')}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings.familyCodeHelp')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[hsl(var(--brand-teal-soft))] p-4">
        <p className="font-mono text-2xl font-extrabold tracking-wider text-[hsl(var(--brand-navy))]">{prefs.householdCode}</p>
        <button type="button" onClick={copy} className="r-chip bg-[hsl(var(--brand-navy))] font-bold text-white">
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? t('settings.copied') : t('common.save')}
        </button>
      </div>

      <form onSubmit={join} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="join-code">{t('settings.joinCode')}</Label>
          <p className="text-xs text-muted-foreground">{t('settings.joinHelp')}</p>
          <Input
            id="join-code"
            value={joinValue}
            onChange={(event) => setJoinValue(event.target.value.toUpperCase())}
            placeholder="FAM-XXXXXX"
            className="r-tap font-mono"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="r-tap gap-2 bg-[hsl(var(--brand-navy))]">
          <DoorOpen className="h-4 w-4" aria-hidden="true" /> {t('settings.join')}
        </Button>
      </form>

      <button
        type="button"
        onClick={clearData}
        className="r-tap r-chip border border-border bg-card text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('settings.clearData')}
      </button>
    </section>
  );
}