import React, { useState } from 'react';
import { Phone, Globe, MapPin, Clock, Info, BadgeCheck } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProviderDialog({ provider }) {
  const { t, prefs } = usePrefs();
  const [open, setOpen] = useState(false);
  const description = prefs.contentLang === 'en' ? provider.description_en || provider.description_es : provider.description_es;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="r-chip bg-[hsl(var(--brand-navy))] font-bold text-white hover:brightness-110">
        {t('common.view')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">{provider.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              {provider.verified ? (
                <span className="inline-flex items-center gap-1 font-bold text-[hsl(var(--brand-teal))]">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {t('legal.verifiedBy')}
                </span>
              ) : null}
              {provider.verification_source ? <span>· {provider.verification_source}</span> : null}
            </DialogDescription>
          </DialogHeader>

          {description ? <p className="text-sm leading-relaxed">{description}</p> : null}

          <dl className="space-y-2 text-sm">
            {provider.phone ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">{t('common.phone')}</dt>
                <Phone className="h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                <dd>
                  <a href={`tel:${provider.phone}`} className="font-semibold text-[hsl(var(--brand-navy))] underline-offset-4 hover:underline">
                    {provider.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {provider.address ? (
              <div className="flex items-start gap-2">
                <dt className="sr-only">{t('common.address')}</dt>
                <MapPin className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                <dd>{provider.address}</dd>
              </div>
            ) : null}
            {provider.hours ? (
              <div className="flex items-start gap-2">
                <dt className="sr-only">{t('common.hours')}</dt>
                <Clock className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                <dd>{provider.hours}</dd>
              </div>
            ) : null}
            {provider.website ? (
              <div className="flex items-start gap-2">
                <dt className="sr-only">{t('common.website')}</dt>
                <Globe className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-teal))]" aria-hidden="true" />
                <dd>
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-[hsl(var(--brand-navy))] underline-offset-4 hover:underline"
                  >
                    {provider.website.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-wrap gap-2">
            {(provider.services || []).map((service) => (
              <span key={service} className="r-chip bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-navy))]">
                {t(`legal.service.${service}`)}
              </span>
            ))}
          </div>

          {(provider.languages || []).length ? (
            <p className="text-sm">
              <span className="font-bold">{t('common.languages')}:</span> {provider.languages.join(', ')}
            </p>
          ) : null}

          <p className="flex items-start gap-2 rounded-2xl bg-[hsl(var(--brand-orange-soft))] p-3 text-xs font-semibold text-[hsl(var(--brand-navy))]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {t('legal.callFirst')}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}