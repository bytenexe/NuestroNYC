import React, { useState } from 'react';
import { Phone, Plus, Trash2, Gavel } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ShareToggle from '@/components/common/ShareToggle';
import SpeakButton from '@/components/common/SpeakButton';

export default function ContactList({ contacts, onChanged }) {
  const { t, prefs } = usePrefs();
  const { whenSignedIn } = useAccountAction();
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', is_attorney: false });
  const [error, setError] = useState('');

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const add = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setError(t('emergency.contactName'));
    return whenSignedIn(async () => {
      await base44.entities.TrustedContact.create({
        household_code: prefs.householdCode,
        name: form.name.trim(),
        relationship: form.relationship.trim(),
        phone: form.phone.trim(),
        is_attorney: form.is_attorney,
      });
      setForm({ name: '', relationship: '', phone: '', is_attorney: false });
      setError('');
      onChanged();
    });
  };

  const remove = async (id) => {
    await base44.entities.TrustedContact.delete(id);
    onChanged();
  };

  return (
    <section className="r-card space-y-4" aria-labelledby="contacts-title">
      <h2 id="contacts-title" className="font-heading text-lg font-extrabold text-[hsl(var(--brand-navy))]">
        {t('emergency.contacts')}
      </h2>

      {contacts.length ? (
        <ul className="space-y-2">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/70 px-3.5 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold">
                  {contact.is_attorney ? <Gavel className="h-3.5 w-3.5 text-[hsl(var(--brand-orange))]" aria-hidden="true" /> : null}
                  {contact.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {contact.relationship}
                  {contact.phone ? ` · ${contact.phone}` : ''}
                </p>
              </div>
              <SpeakButton
                text={[contact.name, contact.relationship, contact.phone].filter(Boolean).join('. ')}
                className="shrink-0"
              />
              <div className="flex shrink-0 items-center gap-1.5">
                <ShareToggle entity="TrustedContact" record={contact} onChanged={onChanged} />
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    aria-label={`${t('emergency.call')} ${contact.name}`}
                    className="r-tap flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--brand-teal))] text-white"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(contact.id)}
                  aria-label={`${t('common.delete')} ${contact.name}`}
                  className="r-tap flex h-11 w-11 items-center justify-center rounded-xl border border-border text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('emergency.noContacts')}</p>
      )}

      <form onSubmit={add} className="space-y-3 rounded-2xl border border-dashed border-border p-4">
        <p className="text-sm font-bold text-[hsl(var(--brand-navy))]">{t('emergency.addContact')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">{t('emergency.contactName')}</Label>
            <Input id="contact-name" value={form.name} onChange={(event) => set({ name: event.target.value })} className="r-tap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-relation">{t('emergency.relationship')}</Label>
            <Input id="contact-relation" value={form.relationship} onChange={(event) => set({ relationship: event.target.value })} className="r-tap" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">{t('emergency.contactPhone')}</Label>
            <Input id="contact-phone" type="tel" value={form.phone} onChange={(event) => set({ phone: event.target.value })} className="r-tap" />
          </div>
          <div className="flex items-end gap-2 pb-2">
            <Checkbox
              id="contact-attorney"
              checked={form.is_attorney}
              onCheckedChange={(checked) => set({ is_attorney: !!checked })}
            />
            <Label htmlFor="contact-attorney" className="text-sm">
              {t('emergency.isAttorney')}
            </Label>
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="r-tap gap-2 bg-[hsl(var(--brand-navy))]">
          <Plus className="h-4 w-4" aria-hidden="true" /> {t('emergency.addContact')}
        </Button>
      </form>
    </section>
  );
}