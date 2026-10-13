import React, { useEffect, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SpeakButton from '@/components/common/SpeakButton';

export default function TranslatePanel() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated, navigateToLogin } = useAccountAction();
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docId, setDocId] = useState('text');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    base44.entities.Document.filter({ household_code: prefs.householdCode }, { sort: '-created_date', limit: 50 })
      .then((page) => setDocuments(page.items))
      .catch(() => setDocuments([]));
  }, [open, prefs.householdCode]);

  const translate = async () => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    setStatus('loading');
    setError('');
    setResult('');
    try {
      const payload = { mode: 'translate', lang: prefs.contentLang, ui_lang: prefs.lang };
      if (docId !== 'text') {
        const doc = documents.find((item) => item.id === docId);
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri, expires_in: 600 });
        payload.file_url = signed_url;
      } else {
        if (!text.trim()) throw new Error(t('luz.pasteText'));
        payload.text = text.trim();
      }
      const response = await base44.functions.invoke('luzAssistant', payload);
      if (!response.data?.translation) throw new Error(response.data?.error || 'Error');
      setResult(response.data.translation);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Error');
      setStatus('error');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="r-tap r-chip border border-border bg-card font-bold hover:bg-secondary"
      >
        <Languages className="h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" /> {t('luz.translate')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{t('luz.translateTitle')}</DialogTitle>
            <DialogDescription>{t('luz.translateHelp')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="translate-source">{t('luz.selectDocument')}</Label>
              <Select value={docId} onValueChange={setDocId}>
                <SelectTrigger id="translate-source" className="r-tap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t('luz.pasteText')}</SelectItem>
                  {documents.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {docId === 'text' ? (
              <div className="space-y-1.5">
                <Label htmlFor="translate-text">{t('luz.pasteText')}</Label>
                <Textarea id="translate-text" rows={5} value={text} onChange={(event) => setText(event.target.value)} />
              </div>
            ) : null}

            <Button onClick={translate} disabled={status === 'loading'} className="r-tap w-full gap-2 bg-[hsl(var(--brand-navy))]">
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {status === 'loading' ? t('luz.translating') : t('luz.translateAction')}
            </Button>

            {error ? <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

            {result ? (
              <div className="rounded-2xl bg-muted/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-teal))]">{t('luz.translation')}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{result}</p>
                <SpeakButton text={result} className="mt-3" />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}