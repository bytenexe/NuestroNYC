import React, { useEffect, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { DOC_TYPES } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EMPTY = { title: '', doc_type: 'passport', issue_date: '', expiry_date: '', notes: '' };

export default function UploadDialog({ open, onOpenChange, defaultType, onUploaded }) {
  const { t, prefs } = usePrefs();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, doc_type: defaultType || 'passport' });
      setFile(null);
      setError('');
    }
  }, [open, defaultType]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return setError(t('docs.name'));
    if (!file) return setError(t('docs.file'));
    setSaving(true);
    setError('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.entities.Document.create({
        household_code: prefs.householdCode,
        title: form.title.trim(),
        doc_type: form.doc_type,
        file_uri,
        file_name: file.name,
        ...(form.issue_date ? { issue_date: form.issue_date } : {}),
        ...(form.expiry_date ? { expiry_date: form.expiry_date } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });
      onUploaded();
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
          <DialogTitle className="font-heading">{t('docs.uploadTitle')}</DialogTitle>
          <DialogDescription>{t('docs.privateNote')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">{t('docs.name')}</Label>
            <Input
              id="doc-title"
              value={form.title}
              onChange={(event) => set({ title: event.target.value })}
              placeholder={t(`doc.${form.doc_type}`)}
              className="r-tap"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-type">{t('docs.type')}</Label>
            <Select value={form.doc_type} onValueChange={(value) => set({ doc_type: value })}>
              <SelectTrigger id="doc-type" className="r-tap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`doc.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-issue">
                {t('docs.issue')} <span className="text-muted-foreground">({t('common.optional')})</span>
              </Label>
              <Input
                id="doc-issue"
                type="date"
                value={form.issue_date}
                onChange={(event) => set({ issue_date: event.target.value })}
                className="r-tap"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-expiry">
                {t('docs.expiry')} <span className="text-muted-foreground">({t('common.optional')})</span>
              </Label>
              <Input
                id="doc-expiry"
                type="date"
                value={form.expiry_date}
                onChange={(event) => set({ expiry_date: event.target.value })}
                className="r-tap"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-file">{t('docs.file')}</Label>
            <Input
              id="doc-file"
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="r-tap pt-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-notes">
              {t('docs.notes')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </Label>
            <Textarea id="doc-notes" value={form.notes} onChange={(event) => set({ notes: event.target.value })} rows={2} />
          </div>

          {error ? (
            <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={saving} className="r-tap w-full gap-2 bg-[hsl(var(--brand-navy))] text-base">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            {saving ? t('common.saving') : t('docs.upload')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}