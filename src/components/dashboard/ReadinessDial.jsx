import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';
import { scoreLabelKey } from '@/lib/readiness';
import SpeakButton from '@/components/common/SpeakButton';

const CIRCUMFERENCE = 1030;

export default function ReadinessDial({ score }) {
  const { t } = usePrefs();
  const safe = Math.min(100, Math.max(0, Math.round(score)));
  const offset = CIRCUMFERENCE - (safe / 100) * CIRCUMFERENCE;
  const spoken = `${t('dash.readiness')}: ${safe}%. ${t(scoreLabelKey(safe))}.`;

  return (
    <div className="rt-dial">
      <svg className="rt-sweep-svg" viewBox="0 0 380 380" style={{ '--rt-offset': offset }} aria-hidden="true">
        <circle cx="190" cy="190" r="164" fill="none" stroke="#cfe8dc" strokeWidth="20" />
        <circle
          className="rt-sweep"
          cx="190"
          cy="190"
          r="164"
          fill="none"
          stroke="#6b2b57"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="rt-num">{safe}%</span>
      <span className="rt-lab">{t('score.label')}</span>
      <p className="rt-state">{t(scoreLabelKey(safe))}</p>
      <p className="rt-dt">{t('dash.readiness')}</p>
      <p className="rt-dh">{t('dash.readinessHelp')}</p>
      <SpeakButton text={spoken} className="rt-listen" />
    </div>
  );
}