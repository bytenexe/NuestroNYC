import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { STAGES } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EMPTY = { title: '', stage: 'application', target_date: '', notes: '' };

export default function MilestoneDialog({ open, onOpenChange, nextIndex, onCreated }) {
  const { t, prefs } = usePrefs();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError('');
    }
  }, [open]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return setError(t('camino.stepTitle'));
    setSaving(true);
    try {
      await base44.entities.JourneyMilestone.create({
        household_code: prefs.householdCode,
        title: form.title.trim(),
        stage: form.stage,
        status: 'pending',
        order_index: nextIndex,
        ...(form.target_date ? { target_date: form.target_date } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });
      onCreated();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{t('camino.addStep')}</DialogTitle>
          <DialogDescription>{t('camino.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="step-title">{t('camino.stepTitle')}</Label>
            <Input id="step-title" value={form.title} onChange={(event) => set({ title: event.target.value })} className="r-tap" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="step-stage">{t('camino.stage')}</Label>
              <Select value={form.stage} onValueChange={(value) => set({ stage: value })}>
                <SelectTrigger id="step-stage" className="r-tap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {t(`stage.${stage}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="step-date">
                {t('camino.targetDate')} <span className="text-muted-foreground">({t('common.optional')})</span>
              </Label>
              <Input
                id="step-date"
                type="date"
                value={form.target_date}
                onChange={(event) => set({ target_date: event.target.value })}
                className="r-tap"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="step-notes">
              {t('camino.notes')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Textarea id="step-notes" rows={2} value={form.notes} onChange={(event) => set({ notes: event.target.value })} />
          </div>

          {error ? <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={saving} className="r-tap w-full gap-2 bg-[hsl(var(--brand-navy))]">
            <Plus className="h-4 w-4" aria-hidden="true" /> {saving ? t('common.saving') : t('camino.addStep')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}