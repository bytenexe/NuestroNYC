import React from 'react';
import { AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { CORE_DOC_TYPES } from '@/lib/constants';
import Speakable from '@/components/common/Speakable';

export default function MissingDocsCard({ documents, onAdd }) {
  const { t } = usePrefs();
  const present = new Set(documents.map((doc) => doc.doc_type));
  const missing = CORE_DOC_TYPES.filter((type) => !present.has(type));

  return (
    <Speakable as="section" className="r-card" aria-labelledby="missing-title" controls>
      <h2 id="missing-title" className="flex items-center gap-2 font-heading text-base font-extrabold text-[hsl(var(--brand-navy))]">
        {missing.length ? (
          <AlertTriangle className="h-5 w-5 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
        )}
        {t('docs.missingTitle')}
      </h2>

      {missing.length ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">{t('docs.missingHelp')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAdd(type)}
                className="r-tap r-chip border border-[hsl(var(--brand-orange))] bg-[hsl(var(--brand-orange-soft))] text-[hsl(var(--brand-navy))] hover:brightness-95"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {t(`doc.${type}`)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
          {t('docs.missingNone')}
        </p>
      )}
    </Speakable>
  );
}