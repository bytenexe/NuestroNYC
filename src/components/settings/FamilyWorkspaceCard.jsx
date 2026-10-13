import React, { useState } from 'react';
import { Users, KeyRound, LogOut, ShieldCheck, RefreshCw, UserMinus, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAuth } from '@/lib/AuthContext';
import { useFamilyAccess } from '@/lib/familyAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FamilyWorkspaceCard() {
  const { t } = usePrefs();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const { workspace, userId, unlocked, unlock, lock, refresh } = useFamilyAccess();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinMfa, setJoinMfa] = useState('');
  const [unlockCode, setUnlockCode] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const call = async (action, payload = {}) => {
    if (!isAuthenticated) {
      navigateToLogin();
      return false;
    }
    setBusy(true);
    setStatus('');
    try {
      const response = await base44.functions.invoke('familyWorkspace', { action, ...payload });
      const error = response.data?.error;
      if (error === 'invalid_code') setStatus(t('family.invalidCode'));
      else if (error === 'invalid_mfa') setStatus(t('family.invalidMfa'));
      else if (error) setStatus(t('family.error'));
      await refresh();
      return !error;
    } catch {
      setStatus(t('family.error'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    if (await call('create', { name })) {
      setName('');
      setStatus(t('family.created'));
    }
  };

  const join = async (event) => {
    event.preventDefault();
    if (await call('join', { join_code: joinCode, mfa_code: joinMfa })) {
      setJoinCode('');
      setJoinMfa('');
      setStatus(t('family.joined'));
    }
  };

  const verifyUnlock = (event) => {
    event.preventDefault();
    if (unlockCode.trim() === String(workspace?.mfa_code)) {
      unlock();
      setUnlockCode('');
      setStatus(t('family.unlocked'));
    } else {
      setStatus(t('family.invalidMfa'));
    }
  };

  const members = (workspace?.member_ids || []).map((id, index) => ({
    id,
    email: workspace?.member_emails?.[index] || '',
  }));
  const isOwner = workspace?.created_by_id === userId;

  return (
    <section className="r-card space-y-4" aria-labelledby="family-title">
      <h2 id="family-title" className="flex items-center gap-2 font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
        <Users className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('family.title')}
      </h2>
      <p className="text-sm text-muted-foreground">{t('family.subtitle')}</p>

      {workspace === undefined ? (
        <p className="text-sm text-muted-foreground" aria-busy="true">
          {t('common.loading')}
        </p>
      ) : workspace === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <form onSubmit={create} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
            <p className="font-bold text-[hsl(var(--brand-navy))]">{t('family.createTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('family.createHelp')}</p>
            <div className="space-y-1.5">
              <Label htmlFor="family-name">{t('family.createName')}</Label>
              <Input id="family-name" value={name} onChange={(event) => setName(event.target.value)} className="r-tap" />
            </div>
            <Button type="submit" disabled={busy} className="r-tap gap-2 bg-[hsl(var(--brand-navy))]">
              <Users className="h-4 w-4" aria-hidden="true" /> {t('family.create')}
            </Button>
          </form>

          <form onSubmit={join} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
            <p className="font-bold text-[hsl(var(--brand-navy))]">{t('family.joinTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('family.joinHelp')}</p>
            <div className="space-y-1.5">
              <Label htmlFor="family-join-code">{t('family.joinCode')}</Label>
              <Input
                id="family-join-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="FAM-XXXXXX"
                className="r-tap font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="family-join-mfa">{t('family.mfaCode')}</Label>
              <Input
                id="family-join-mfa"
                inputMode="numeric"
                maxLength={6}
                value={joinMfa}
                onChange={(event) => setJoinMfa(event.target.value.replace(/\D/g, ''))}
                className="r-tap font-mono"
              />
            </div>
            <Button type="submit" disabled={busy} variant="outline" className="r-tap gap-2">
              <KeyRound className="h-4 w-4" aria-hidden="true" /> {t('family.join')}
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-base font-extrabold text-[hsl(var(--brand-navy))]">{workspace.name}</p>
            <span
              className={`r-chip ${
                unlocked
                  ? 'bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {unlocked ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              {unlocked ? t('family.unlocked') : t('family.locked')}
            </span>
          </div>

          {isOwner ? (
            <div className="grid gap-3 rounded-2xl bg-muted/70 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('family.joinCode')}</p>
                <p className="font-mono text-base font-bold text-[hsl(var(--brand-navy))]">{workspace.join_code}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('family.mfaCode')}</p>
                <p className="font-mono text-base font-bold text-[hsl(var(--brand-navy))]">{workspace.mfa_code}</p>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">{t('family.help')}</p>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  if (await call('rotate')) setStatus(t('family.rotated'));
                }}
                className="r-tap gap-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('family.rotate')}
              </Button>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('family.members')}</p>
            <ul className="mt-2 space-y-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/70 px-3.5 py-2.5">
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {member.email || member.id}
                    {member.id === userId ? ` · ${t('family.you')}` : ''}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {String(member.id) === String(workspace.created_by_id) ? (
                      <span className="r-chip bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]">{t('family.owner')}</span>
                    ) : null}
                    {isOwner && member.id !== userId ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (await call('removeMember', { member_id: member.id })) setStatus(t('family.removed'));
                        }}
                        aria-label={`${t('family.remove')} ${member.email || member.id}`}
                        className="r-tap flex h-9 w-9 items-center justify-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {unlocked ? (
            <Button type="button" variant="outline" onClick={lock} className="r-tap gap-2">
              <Lock className="h-4 w-4" aria-hidden="true" /> {t('family.lockAction')}
            </Button>
          ) : (
            <form onSubmit={verifyUnlock} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
              <p className="font-bold text-[hsl(var(--brand-navy))]">{t('family.unlockTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('family.unlockHelp')}</p>
              <div className="space-y-1.5 sm:max-w-xs">
                <Label htmlFor="family-unlock">{t('family.mfaCode')}</Label>
                <Input
                  id="family-unlock"
                  inputMode="numeric"
                  maxLength={6}
                  value={unlockCode}
                  onChange={(event) => setUnlockCode(event.target.value.replace(/\D/g, ''))}
                  className="r-tap font-mono"
                />
              </div>
              <Button type="submit" className="r-tap gap-2 bg-[hsl(var(--brand-navy))]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {t('family.unlockAction')}
              </Button>
            </form>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={async () => {
              if (await call('leave')) {
                lock();
                setStatus(t('family.left'));
              }
            }}
            className="r-tap gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {t('family.leave')}
          </Button>
        </div>
      )}

      {status ? (
        <p role="status" className="text-sm font-semibold text-[hsl(var(--brand-teal))]">
          {status}
        </p>
      ) : null}
    </section>
  );
}