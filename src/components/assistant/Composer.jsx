import React, { useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Composer({ value, onChange, onSend, sending }) {
  const { t } = usePrefs();
  const areaRef = useRef(null);

  const submit = () => {
    if (!value.trim() || sending) return;
    onSend(value.trim());
    onChange('');
    areaRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="sticky bottom-20 z-20 rounded-3xl border border-border bg-card/95 p-3 backdrop-blur lg:bottom-4"
    >
      <label className="sr-only" htmlFor="luz-input">
        {t('luz.placeholder')}
      </label>
      <Textarea
        id="luz-input"
        ref={areaRef}
        value={value}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('luz.placeholder')}
        className="resize-none border-0 bg-transparent text-base focus-visible:ring-0"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[11px] leading-tight text-muted-foreground">{t('luz.disclaimer')}</p>
        <Button
          type="submit"
          disabled={sending || !value.trim()}
          className="r-tap shrink-0 gap-2 bg-[hsl(var(--brand-navy))] px-5"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {t('luz.send')}
        </Button>
      </div>
    </form>
  );
}