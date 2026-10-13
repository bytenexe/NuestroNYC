import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import { tLabel } from '@/lib/constants';
import SpeakButton from '@/components/common/SpeakButton';

export default function ReadinessFacts({ completed, missing, recommendations }) {
  const { t, prefs } = usePrefs();
  const listText = (items) => items.map((label) => tLabel(label, prefs.contentLang)).join('. ');

  return (
    <>
      <div className="rt-dm">
        <div className="rt-card">
          <h3>
            <Check aria-hidden="true" /> {t('dash.completed')} ({completed.length})
          </h3>
          <ul>
            {completed.map((label) => (
              <li key={label.es}>{tLabel(label, prefs.contentLang)}</li>
            ))}
            {!completed.length ? <li>{t('common.empty')}</li> : null}
          </ul>
          <SpeakButton
            text={`${t('dash.completed')}: ${completed.length}. ${listText(completed)}`}
            className="rt-listen"
          />
        </div>

        <div className="rt-card">
          <h3>
            <AlertTriangle aria-hidden="true" /> {t('dash.missing')} ({missing.length})
          </h3>
          <ul>
            {missing.slice(0, 5).map((label) => (
              <li key={label.es}>{tLabel(label, prefs.contentLang)}</li>
            ))}
            {!missing.length ? <li>{t('docs.missingNone')}</li> : null}
          </ul>
          <SpeakButton
            text={`${t('dash.missing')}: ${missing.length}. ${listText(missing)}`}
            className="rt-listen"
          />
        </div>
      </div>

      {recommendations.length ? (
        <div className="rt-rec">
          <h3>{t('dash.recommendations')}</h3>
          <ul>
            {recommendations.map((rec) => (
              <li key={rec.es}>• {tLabel(rec, prefs.contentLang)}</li>
            ))}
          </ul>
          <SpeakButton text={`${t('dash.recommendations')}: ${listText(recommendations)}`} className="rt-listen" />
        </div>
      ) : null}
    </>
  );
}