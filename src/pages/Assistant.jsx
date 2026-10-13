import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, PlusCircle, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePrefs } from '@/lib/PreferencesContext';
import { useAccountAction } from '@/lib/accountAction';
import PageHeader from '@/components/common/PageHeader';
import MessageBubble from '@/components/assistant/MessageBubble';
import Composer from '@/components/assistant/Composer';
import QuickPrompts from '@/components/assistant/QuickPrompts';
import TranslatePanel from '@/components/assistant/TranslatePanel';
import { Button } from '@/components/ui/button';

export default function Assistant() {
  const { t, prefs } = usePrefs();
  const { isAuthenticated, navigateToLogin } = useAccountAction();
  const location = useLocation();
  const code = prefs.householdCode;
  const [messages, setMessages] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const autoSent = useRef(false);

  const loadLatest = useCallback(async () => {
    if (!isAuthenticated) {
      setConversation(null);
      setMessages([]);
      return;
    }
    const page = await base44.entities.AIConversation.filter({ household_code: code }, { sort: '-last_message_at', limit: 1 });
    const existing = page.items[0];
    if (!existing) {
      setConversation(null);
      setMessages([]);
      return;
    }
    const history = await base44.entities.AIMessage.filter({ conversation_id: existing.id }, { sort: 'created_date', limit: 100 });
    setConversation(existing);
    setMessages(history.items);
  }, [code, isAuthenticated]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const send = useCallback(
    async (question) => {
      if (!question || sending) return;
      if (!isAuthenticated) {
        navigateToLogin();
        return;
      }
      setSending(true);
      const now = new Date().toISOString();
      try {
        let active = conversation;
        if (!active) {
          active = await base44.entities.AIConversation.create({
            household_code: code,
            title: question.slice(0, 60),
            lang: prefs.contentLang,
            last_message_at: now,
          });
          setConversation(active);
        }

        const userMessage = await base44.entities.AIMessage.create({
          household_code: code,
          conversation_id: active.id,
          role: 'user',
          content: question,
          lang: prefs.contentLang,
        });
        const priorHistory = (messages || []).slice(-8).map((m) => ({ role: m.role, content: m.content }));
        setMessages((prev) => [...(prev || []), userMessage]);

        const response = await base44.functions.invoke('luzAssistant', {
          mode: 'chat',
          question,
          lang: prefs.contentLang,
          ui_lang: prefs.lang,
          history: priorHistory,
        });
        const answer = response.data?.answer || response.data?.error || '';
        const assistantMessage = await base44.entities.AIMessage.create({
          household_code: code,
          conversation_id: active.id,
          role: 'assistant',
          content: answer,
          lang: prefs.contentLang,
        });
        await base44.entities.AIConversation.update(active.id, { last_message_at: new Date().toISOString() });
        setMessages((prev) => [...(prev || []), assistantMessage]);
      } finally {
        setSending(false);
      }
    },
    [code, conversation, isAuthenticated, messages, prefs.contentLang, sending]
  );

  const initialQuestion = location.state?.question;
  useEffect(() => {
    if (initialQuestion && !autoSent.current) {
      autoSent.current = true;
      setInput('');
      send(initialQuestion);
    }
  }, [initialQuestion, send]);

  const startNew = () => {
    setConversation(null);
    setMessages([]);
    setInput('');
  };

  return (
    <div>
      <PageHeader
        title={t('luz.title')}
        subtitle={t('luz.subtitle')}
        icon={Sparkles}
        actions={
          <>
            <TranslatePanel />
            <Button variant="outline" onClick={startNew} className="r-tap gap-2">
              <PlusCircle className="h-4 w-4" aria-hidden="true" /> {t('luz.newChat')}
            </Button>
          </>
        }
      />

      <p className="mb-4 flex items-start gap-2 rounded-2xl bg-[hsl(var(--brand-orange-soft))] p-3.5 text-sm font-medium text-[hsl(var(--brand-navy))]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t('luz.disclaimer')}
      </p>

      <div className="mb-4">
        <QuickPrompts onPick={(prompt) => send(prompt)} disabled={sending} />
      </div>

      <ul aria-live="polite" className="space-y-5 pb-4">
        {!messages?.length ? <MessageBubble message={{ role: 'assistant', content: t('luz.greeting') }} /> : null}
        {(messages || []).map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {sending ? (
          <li className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[hsl(var(--brand-teal))]" aria-hidden="true" />
            {t('luz.thinking')}
          </li>
        ) : null}
      </ul>

      <Composer value={input} onChange={setInput} onSend={send} sending={sending} />
    </div>
  );
}