import React from 'react';
import SpeakButton from '@/components/common/SpeakButton';

export default function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--brand-teal-soft))] text-[hsl(var(--brand-teal))]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[hsl(var(--brand-navy))] sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
          <SpeakButton text={subtitle ? `${title}. ${subtitle}` : title} className="mt-2" />
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}