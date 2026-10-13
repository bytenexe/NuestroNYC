import React, { useState } from 'react';
import { BookOpen, Printer } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SpeakButton from '@/components/common/SpeakButton';

export default function GuideDialog({ resource }) {
  const { t, prefs } = usePrefs();
  const [open, setOpen] = useState(false);
  const title = prefs.contentLang === 'en' ? resource.title_en || resource.title_es : resource.title_es;
  const summary = prefs.contentLang === 'en' ? resource.summary_en || resource.summary_es : resource.summary_es;
  const body = prefs.contentLang === 'en' ? resource.body_en || resource.body_es : resource.body_es;

  return (
    <>
      <article className="r-card flex flex-col">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))]">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-3 font-heading text-base font-bold leading-snug">{title}</h3>
        {summary ? <p className="mt-2 text-sm text-muted-foreground">{summary}</p> : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="r-tap r-chip mt-4 self-start bg-[hsl(var(--brand-navy))] font-bold text-white hover:brightness-110"
        >
          {t('common.view')}
        </button>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">{title}</DialogTitle>
            {resource.source_name ? <DialogDescription>{resource.source_name}</DialogDescription> : null}
          </DialogHeader>

          <div className="prose-sm whitespace-pre-line text-[15px] leading-relaxed">{body}</div>

          <div className="flex flex-wrap gap-2">
            <SpeakButton text={`${title}. ${body}`} />
            <button
              type="button"
              onClick={() => window.print()}
              className="r-chip border border-border bg-card hover:bg-secondary"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.print')}
            </button>
          </div>

          {resource.source_url ? (
            <a href={resource.source_url} target="_blank" rel="noreferrer noopener" className="r-link text-sm">
              {resource.source_name || t('common.website')}
            </a>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}