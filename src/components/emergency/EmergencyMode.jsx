import React from 'react';
import { Phone, X, FileText, ShieldAlert, Gavel, Check } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { EMERGENCY_CHECKLIST, tLabel } from '@/lib/constants';
import { openPrivateFile } from '@/lib/files';

export default function EmergencyMode({ open, onClose, contacts, documents, plan }) {
  const { t, prefs } = usePrefs();

  if (!open) return null;

  const attorneys = contacts.filter((contact) => contact.is_attorney);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('emergency.modeTitle')}
      className="fixed inset-0 z-50 overflow-y-auto bg-[hsl(var(--brand-navy-deep))] text-white"
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-16">
        <header className="flex items-start justify-between gap-4">
          <h1 className="flex items-center gap-3 font-heading text-2xl font-extrabold">
            <ShieldAlert className="h-7 w-7 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
            {t('emergency.modeTitle')}
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-white/30 px-4 py-2.5 font-bold hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" /> {t('emergency.exit')}
          </button>
        </header>

        <p className="mt-3 rounded-2xl bg-white/10 p-4 text-sm font-semibold">{t('emergency.modeFooter')}</p>

        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white/70">{t('emergency.contacts')}</h2>
          {contacts.length ? (
            <ul className="mt-3 space-y-3">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-[hsl(var(--brand-navy-deep))]">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-extrabold">{contact.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{contact.relationship || contact.phone}</p>
                  </div>
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex min-h-[56px] items-center gap-2 rounded-2xl bg-[hsl(var(--brand-navy))] px-5 font-bold text-white"
                    >
                      <Phone className="h-5 w-5" aria-hidden="true" /> {t('emergency.call')}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-white/70">{t('emergency.noContacts')}</p>
          )}
        </section>

        {attorneys.length ? (
          <section className="mt-6 rounded-2xl bg-white/10 p-4">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70">
              <Gavel className="h-4 w-4 text-[hsl(var(--brand-orange))]" aria-hidden="true" /> {t('emergency.isAttorney')}
            </h2>
            <ul className="mt-2 space-y-1 text-lg font-bold">
              {attorneys.map((contact) => (
                <li key={contact.id}>
                  {contact.name} {contact.phone ? <span className="text-white/80">· {contact.phone}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white/70">{t('emergency.docs')}</h2>
          {documents.length ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {documents.slice(0, 8).map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => openPrivateFile(doc.file_uri)}
                    className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl bg-white px-4 text-left font-bold text-[hsl(var(--brand-navy-deep))]"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                    <span className="truncate">{doc.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-white/70">{t('emergency.noDocs')}</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-white/10 p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white/70">{t('emergency.checklist')}</h2>
          <ul className="mt-2 space-y-2 text-sm font-semibold">
            {EMERGENCY_CHECKLIST.map((entry) => (
              <li key={entry.en} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-orange))]" aria-hidden="true" />
                {tLabel(entry, prefs.contentLang)}
              </li>
            ))}
          </ul>
        </section>

        {plan ? (
          <section className="mt-6 rounded-2xl bg-white/10 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-white/70">{t('emergency.plan')}</h2>
            <dl className="mt-2 space-y-1.5 text-sm">
              {plan.meeting_place ? (
                <div>
                  <dt className="font-bold">{t('emergency.meetingPlace')}</dt>
                  <dd className="text-white/85">{plan.meeting_place}</dd>
                </div>
              ) : null}
              {plan.backup_place ? (
                <div>
                  <dt className="font-bold">{t('emergency.backupPlace')}</dt>
                  <dd className="text-white/85">{plan.backup_place}</dd>
                </div>
              ) : null}
              {plan.plan_notes ? <dd className="whitespace-pre-line text-white/85">{plan.plan_notes}</dd> : null}
              {plan.allergies || plan.medications || plan.conditions ? (
                <div>
                  <dt className="font-bold">{t('emergency.medical')}</dt>
                  <dd className="text-white/85">
                    {[plan.allergies, plan.medications, plan.conditions].filter(Boolean).join(' · ')}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}
      </div>
    </div>
  );
}