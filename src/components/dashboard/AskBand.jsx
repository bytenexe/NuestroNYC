import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';

export default function AskBand() {
  const { t } = usePrefs();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    navigate('/assistant', { state: { question: value } });
  };

  return (
    <section className="rt-ask" aria-labelledby="luz-quick-title">
      <h2 id="luz-quick-title">
        <Sparkles aria-hidden="true" />
        {t('dash.askTitle')}
      </h2>
      <p className="rt-p">{t('luz.subtitle')}</p>

      <form onSubmit={submit} className="rt-fm">
        <label className="sr-only" htmlFor="quick-ask">
          {t('dash.askPlaceholder')}
        </label>
        <input
          id="quick-ask"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t('dash.askPlaceholder')}
        />
        <button type="submit">
          <Send aria-hidden="true" />
          {t('dash.askButton')}
        </button>
      </form>
      <p className="rt-dis">{t('luz.disclaimer')}</p>
    </section>
  );
}