import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { openPrivateFile } from '@/lib/files';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SpeakButton from '@/components/common/SpeakButton';

export default function AnalyzePanel({ doc, onApplied }) {
  const { t, prefs } = usePrefs();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    setOpen(true);
    setStatus('loading');
    setError('');
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri, expires_in: 600 });
      const response = await base44.functions.invoke('luzAssistant', {
        mode: 'analyze_document',
        file_url: signed_url,
        lang: prefs.contentLang,
        ui_lang: prefs.lang,
      });
      const result = response.data?.analysis;
      if (!result) throw new Error(response.data?.error || 'No analysis');
      setAnalysis(result);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Error');
      setStatus('error');
    }
  };

  const apply = async () => {
    await base44.entities.Document.update(doc.id, {
      title: analysis.title || doc.title,
      doc_type: analysis.doc_type || doc.doc_type,
      issue_date: (analysis.issue_date || '').slice(0, 10) || doc.issue_date,
      expiry_date: (analysis.expiry_date || '').slice(0, 10) || doc.expiry_date,
      ai_summary: [analysis.summary, analysis.next_step ? `${t('camino.nextTitle')}: ${analysis.next_step}` : '']
        .filter(Boolean)
        .join('\n\n'),
      ai_key_dates: analysis.other_dates || '',
    });
    setOpen(false);
    onApplied();
  };

  return (
    <>
      <button type="button" onClick={analyze} className="r-tap r-chip border border-border bg-card hover:bg-secondary">
        <Sparkles className="h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('docs.analyze')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading">
              <Sparkles className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('docs.analysis')}
            </DialogTitle>
            <DialogDescription>{doc.title}</DialogDescription>
          </DialogHeader>

          {status === 'loading' ? (
            <p className="flex items-center gap-2 py-6 text-sm font-semibold text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--brand-teal))]" aria-hidden="true" />
              {t('docs.analyzing')}
            </p>
          ) : null}

          {error ? <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

          {analysis ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-muted/70 p-4">
                <p className="text-sm font-bold">{analysis.title}</p>
                <p className="text-xs font-semibold text-[hsl(var(--brand-teal))]">{t(`doc.${analysis.doc_type}`)}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{analysis.summary}</p>
                <SpeakButton text={`${analysis.summary} ${analysis.next_step || ''}`} className="mt-3" />
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                {analysis.issue_date ? (
                  <div className="rounded-2xl border border-border p-3">
                    <dt className="text-xs font-bold uppercase text-muted-foreground">{t('docs.issue')}</dt>
                    <dd className="font-semibold">{analysis.issue_date}</dd>
                  </div>
                ) : null}
                {analysis.expiry_date ? (
                  <div className="rounded-2xl border border-border p-3">
                    <dt className="text-xs font-bold uppercase text-muted-foreground">{t('docs.expiry')}</dt>
                    <dd className="font-semibold">{analysis.expiry_date}</dd>
                  </div>
                ) : null}
              </dl>
              {analysis.other_dates ? (
                <p className="text-sm text-muted-foreground">{analysis.other_dates}</p>
              ) : null}
              {analysis.next_step ? (
                <p className="rounded-2xl bg-[hsl(var(--brand-orange-soft))] p-3 text-sm font-semibold">
                  {analysis.next_step}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">{t('luz.disclaimer')}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={apply} className="r-tap bg-[hsl(var(--brand-navy))]">
                  {t('docs.applyAnalysis')}
                </Button>
                <Button variant="outline" onClick={() => openPrivateFile(doc.file_uri)} className="r-tap">
                  {t('docs.openFile')}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}