import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, FileText, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { openPrivateFile } from '@/lib/files';
import PageHeader from '@/components/common/PageHeader';
import PlanForm from '@/components/emergency/PlanForm';
import ContactList from '@/components/emergency/ContactList';
import EmergencyMode from '@/components/emergency/EmergencyMode';
import FamilyLockBanner from '@/components/common/FamilyLockBanner';
import { useFamilyAccess } from '@/lib/familyAccess';
import Speakable from '@/components/common/Speakable';
import { Button } from '@/components/ui/button';

export default function Emergency() {
  const { t } = usePrefs();
  const { prefs } = usePrefs();
  const code = prefs.householdCode;
  const { isAuthenticated } = useAccountAction();
  const { visible, hidden } = useFamilyAccess();
  const [plan, setPlan] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [ready, setReady] = useState(false);
  const [modeOpen, setModeOpen] = useState(() => new URLSearchParams(window.location.search).get('mode') === '1');

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setPlan(null);
      setContacts([]);
      setDocuments([]);
      setReady(true);
      return;
    }
    const scope = { $or: [{ household_code: code }, { shared: true }] };
    const [planPage, contactPage, docPage] = await Promise.all([
      base44.entities.EmergencyPlan.filter(scope, { limit: 1 }),
      base44.entities.TrustedContact.filter(scope, { limit: 50 }),
      base44.entities.Document.filter(scope, { sort: 'expiry_date', limit: 20 }),
    ]);
    setPlan(planPage.items[0] || null);
    setContacts(contactPage.items);
    setDocuments(docPage.items);
    setReady(true);
  }, [code, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const shownDocs = visible(documents);
  const shownContacts = visible(contacts);

  return (
    <div>
      <PageHeader
        title={t('emergency.title')}
        subtitle={t('emergency.subtitle')}
        icon={ShieldAlert}
        actions={
          <Button
            onClick={() => setModeOpen(true)}
            className="r-tap gap-2 bg-[hsl(var(--brand-orange))] text-base font-extrabold text-[hsl(var(--brand-navy-deep))] hover:brightness-105"
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" /> {t('emergency.mode')}
          </Button>
        }
      />

      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-muted p-3.5 text-sm text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {t('emergency.privacy')}
      </p>

      <FamilyLockBanner count={hidden([...contacts, ...documents, plan].filter(Boolean)).length} />

      {!ready ? (
        <div className="space-y-4" aria-busy="true">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <div className="space-y-5">
          <Speakable as="section" className="r-card" aria-labelledby="docs-quick-title" controls>
            <h2 id="docs-quick-title" className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
              {t('emergency.docs')}
            </h2>
            {shownDocs.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {shownDocs.slice(0, 8).map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => openPrivateFile(doc.file_uri)}
                      className="r-tap flex w-full items-center gap-3 rounded-2xl bg-muted/70 px-4 py-3 text-left text-sm font-bold hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{t('emergency.noDocs')}</p>
            )}
          </Speakable>

          <PlanForm plan={plan} onSaved={load} />
          <ContactList contacts={shownContacts} onChanged={load} />
        </div>
      )}

      <EmergencyMode
        open={modeOpen}
        onClose={() => setModeOpen(false)}
        contacts={shownContacts}
        documents={shownDocs}
        plan={plan}
      />
    </div>
  );
}