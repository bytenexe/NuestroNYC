import React, { useCallback, useEffect, useState } from 'react';
import { FolderLock, Upload, Search, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { DOC_TYPES } from '@/lib/constants';
import PageHeader from '@/components/common/PageHeader';
import DocumentCard from '@/components/documents/DocumentCard';
import UploadDialog from '@/components/documents/UploadDialog';
import MissingDocsCard from '@/components/documents/MissingDocsCard';
import FamilyLockBanner from '@/components/common/FamilyLockBanner';
import { useFamilyAccess } from '@/lib/familyAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Documents() {
  const { t, prefs } = usePrefs();
  const code = prefs.householdCode;
  const { isAuthenticated, whenSignedIn } = useAccountAction();
  const { visible, hidden } = useFamilyAccess();
  const [documents, setDocuments] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetType, setPresetType] = useState('passport');

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setDocuments([]);
      return;
    }
    const query = { $or: [{ household_code: code }, { shared: true }] };
    if (type !== 'all') query.doc_type = type;
    if (search.trim()) query.title = { $regex: search.trim(), $options: 'i' };
    const page = await base44.entities.Document.filter(query, { sort: '-created_date', limit: 100 });
    setDocuments(page.items);
  }, [code, isAuthenticated, search, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const openUpload = (preset) => {
    whenSignedIn(() => {
      setPresetType(preset || 'passport');
      setDialogOpen(true);
    });
  };

  const shown = documents === null ? [] : visible(documents);

  return (
    <div>
      <PageHeader
        title={t('docs.title')}
        subtitle={t('docs.subtitle')}
        icon={FolderLock}
        actions={
          <Button onClick={() => openUpload()} className="r-tap gap-2 bg-[hsl(var(--brand-navy))] text-base">
            <Upload className="h-4 w-4" aria-hidden="true" /> {t('docs.upload')}
          </Button>
        }
      />

      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-[hsl(var(--brand-teal-soft))] p-3.5 text-sm text-[hsl(var(--brand-navy))]">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t('docs.privateNote')}
      </p>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label className="sr-only" htmlFor="doc-search">
            {t('docs.searchPlaceholder')}
          </label>
          <Input
            id="doc-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('docs.searchPlaceholder')}
            className="r-tap pl-9"
          />
        </div>
        <div className="sm:w-56">
          <label className="sr-only" htmlFor="doc-filter">
            {t('docs.filterType')}
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="doc-filter" className="r-tap">
              <SelectValue placeholder={t('docs.filterType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {DOC_TYPES.map((docType) => (
                <SelectItem key={docType} value={docType}>
                  {t(`doc.${docType}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FamilyLockBanner count={documents ? hidden(documents).length : 0} />

      {documents === null ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <MissingDocsCard documents={documents} onAdd={openUpload} />

          {shown.length ? (
            <>
              <p className="text-sm font-semibold text-muted-foreground">
                {shown.length} {t('docs.count')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {shown.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} onChanged={load} />
                ))}
              </div>
            </>
          ) : (
            <div className="r-card text-center">
              <h2 className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">{t('docs.noDocs')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('docs.noDocsHelp')}</p>
              <Button onClick={() => openUpload()} className="r-tap mt-4 gap-2 bg-[hsl(var(--brand-navy))]">
                <Upload className="h-4 w-4" aria-hidden="true" /> {t('docs.upload')}
              </Button>
            </div>
          )}
        </div>
      )}

      <UploadDialog open={dialogOpen} onOpenChange={setDialogOpen} defaultType={presetType} onUploaded={load} />
    </div>
  );
}