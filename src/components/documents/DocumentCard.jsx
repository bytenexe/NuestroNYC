import React, { useState } from 'react';
import { FileText, Eye, Trash2, CalendarClock, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { expiryState, formatDate } from '@/lib/readiness';
import { openPrivateFile } from '@/lib/files';
import SpeakButton from '@/components/common/SpeakButton';
import AnalyzePanel from '@/components/documents/AnalyzePanel';
import ShareToggle from '@/components/common/ShareToggle';
import Speakable from '@/components/common/Speakable';

export default function DocumentCard({ doc, onChanged }) {
  const { t, prefs } = usePrefs();
  const [busy, setBusy] = useState(false);
  const expiry = expiryState(doc.expiry_date);

  const chip =
    expiry.state === 'expired'
      ? 'bg-destructive/10 text-destructive'
      : expiry.state === 'expiring'
      ? 'bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]'
      : expiry.state === 'valid'
      ? 'bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]'
      : 'bg-muted text-muted-foreground';

  const openFile = async () => {
    setBusy(true);
    try {
      await openPrivateFile(doc.file_uri);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t('docs.deleteConfirm'))) return;
    await base44.entities.Document.delete(doc.id);
    onChanged();
  };

  return (
    <Speakable as="article" className="r-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-teal))]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-bold text-foreground">{doc.title}</h3>
            <p className="text-xs font-semibold text-muted-foreground">{t(`doc.${doc.doc_type}`)}</p>
          </div>
        </div>
        <span className={`r-chip shrink-0 ${chip}`}>
          {expiry.state === 'expired'
            ? t('common.expired')
            : expiry.state === 'expiring'
            ? t('common.expiringSoon')
            : expiry.state === 'valid'
            ? t('common.valid')
            : t('docs.noExpiry')}
        </span>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {doc.expiry_date ? (
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">{t('docs.expiry')}</dt>
            <dd>
              {t('dash.expiresOn')} {formatDate(doc.expiry_date, prefs.lang)}
            </dd>
          </div>
        ) : null}
        {doc.issue_date ? (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <dt className="sr-only">{t('docs.issue')}</dt>
            <dd>{formatDate(doc.issue_date, prefs.lang)}</dd>
          </div>
        ) : null}
      </dl>

      {doc.ai_summary ? (
        <div className="rounded-2xl bg-muted/70 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--brand-teal))]">{t('docs.aiSummary')}</p>
          <p className="mt-1 text-sm leading-relaxed">{doc.ai_summary}</p>
          <SpeakButton text={doc.ai_summary} className="mt-2" />
        </div>
      ) : null}

      {doc.notes ? <p className="text-sm text-muted-foreground">{doc.notes}</p> : null}

      <div className="mt-auto flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openFile}
          disabled={busy}
          className="r-tap r-chip border border-border bg-card hover:bg-secondary disabled:opacity-60"
        >
          <Eye className="h-4 w-4" aria-hidden="true" /> {busy ? t('docs.opening') : t('docs.openFile')}
        </button>
        <AnalyzePanel doc={doc} onApplied={onChanged} />
        <ShareToggle entity="Document" record={doc} onChanged={onChanged} />
        <button
          type="button"
          onClick={remove}
          className="r-tap r-chip border border-border bg-card text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" /> {t('common.delete')}
        </button>
      </div>
    </Speakable>
  );
}