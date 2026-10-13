import React, { useEffect, useState } from 'react';
import { Save, Loader2, HeartPulse } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ShareToggle from '@/components/common/ShareToggle';
import Speakable from '@/components/common/Speakable';

const EMPTY = {
  meeting_place: '',
  backup_place: '',
  plan_notes: '',
  allergies: '',
  medications: '',
  conditions: '',
  blood_type: '',
  children_info: '',
};

export default function PlanForm({ plan, onSaved }) {
  const { t, householdCode } = usePrefs();
  const { whenSignedIn } = useAccountAction();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...EMPTY, ...(plan || {}) });
  }, [plan]);

  const set = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const submit = (event) => {
    event.preventDefault();
    whenSignedIn(async () => {
      setSaving(true);
      try {
        if (plan?.id) {
          await base44.entities.EmergencyPlan.update(plan.id, {
            ...form,
            household_code: plan.household_code || householdCode,
          });
        } else {
          await base44.entities.EmergencyPlan.create({ ...form, household_code: householdCode });
        }
        setSaved(true);
        onSaved();
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <Speakable as="form" onSubmit={submit} className="r-card space-y-4" aria-labelledby="plan-title">
      <h2 id="plan-title" className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">{t('emergency.plan')}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="meeting">{t('emergency.meetingPlace')}</Label>
          <Input id="meeting" value={form.meeting_place} onChange={(event) => set({ meeting_place: event.target.value })} className="r-tap" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="backup">{t('emergency.backupPlace')}</Label>
          <Input id="backup" value={form.backup_place} onChange={(event) => set({ backup_place: event.target.value })} className="r-tap" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="plan-notes">{t('emergency.planNotes')}</Label>
        <Textarea id="plan-notes" rows={3} value={form.plan_notes} onChange={(event) => set({ plan_notes: event.target.value })} />
      </div>

      <fieldset className="space-y-3 rounded-2xl bg-muted/70 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-bold text-[hsl(var(--brand-navy))]">
          <HeartPulse className="h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" /> {t('emergency.medical')}
        </legend>
        <p className="text-xs text-muted-foreground">{t('emergency.medicalHelp')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="allergies">{t('emergency.allergies')}</Label>
            <Input id="allergies" value={form.allergies} onChange={(event) => set({ allergies: event.target.value })} className="r-tap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="medications">{t('emergency.medications')}</Label>
            <Input id="medications" value={form.medications} onChange={(event) => set({ medications: event.target.value })} className="r-tap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="conditions">{t('emergency.conditions')}</Label>
            <Input id="conditions" value={form.conditions} onChange={(event) => set({ conditions: event.target.value })} className="r-tap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blood">{t('emergency.bloodType')}</Label>
            <Input id="blood" value={form.blood_type} onChange={(event) => set({ blood_type: event.target.value })} className="r-tap" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="children">{t('emergency.childrenInfo')}</Label>
          <Textarea id="children" rows={2} value={form.children_info} onChange={(event) => set({ children_info: event.target.value })} />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving} className="r-tap gap-2 bg-[hsl(var(--brand-navy))]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {t('emergency.savePlan')}
        </Button>
        {saved ? <p className="text-sm font-bold text-[hsl(var(--brand-teal))]">{t('emergency.planSaved')}</p> : null}
        {plan?.id ? <ShareToggle entity="EmergencyPlan" record={plan} onChanged={onSaved} /> : null}
      </div>
    </Speakable>
  );
}