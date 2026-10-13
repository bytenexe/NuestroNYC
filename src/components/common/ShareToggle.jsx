import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Globe2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useFamilyAccess } from '@/lib/familyAccess';

const CLIENTS = {
  Document: () => base44.entities.Document,
  Case: () => base44.entities.Case,
  Reminder: () => base44.entities.Reminder,
  JourneyMilestone: () => base44.entities.JourneyMilestone,
  TrustedContact: () => base44.entities.TrustedContact,
  EmergencyPlan: () => base44.entities.EmergencyPlan,
};

export default function ShareToggle({ entity, record, onChanged }) {
  const { t } = usePrefs();
  const { workspace, unlocked } = useFamilyAccess();
  const [busy, setBusy] = useState(false);

  if (!workspace) {
    return (
      <Link to="/settings" className="r-chip shrink-0 border border-border bg-card hover:bg-secondary">
        <Users className="h-3.5 w-3.5" aria-hidden="true" /> {t('family.setUp')}
      </Link>
    );
  }

  if (record.shared && !unlocked) {
    return (
      <Link to="/settings" className="r-chip shrink-0 border border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] font-bold text-[hsl(var(--brand-navy))]">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t('family.lockedBadge')}
      </Link>
    );
  }

  const toggle = async () => {
    const client = CLIENTS[entity]?.();
    if (!client) return;
    setBusy(true);
    try {
      if (record.shared) {
        await client.update(record.id, { shared: false, workspace_id: '', members: [] });
      } else {
        await client.update(record.id, {
          shared: true,
          workspace_id: workspace.id,
          members: workspace.member_ids || [],
        });
      }
    } finally {
      setBusy(false);
    }
    onChanged?.();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={!!record.shared}
      title={t('family.shareHelp')}
      className={`r-chip shrink-0 border font-bold disabled:opacity-60 ${
        record.shared
          ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
          : 'border-border bg-card text-muted-foreground hover:bg-secondary'
      }`}
    >
      {record.shared ? (
        <>
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> {t('family.sharedBadge')}
        </>
      ) : (
        <>
          <Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('family.privateBadge')}
        </>
      )}
    </button>
  );
}