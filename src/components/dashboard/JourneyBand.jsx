import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import Speakable from '@/components/common/Speakable';
import { Image } from '@/components/ui/image';

const JOURNEY_IMAGE =
  'https://media.base44.com/images/public/6aca6b70e540702ef09fed45/5864b1d2f_generated_a4a6481e.jpg';

export default function JourneyBand({ milestones }) {
  const { t } = usePrefs();
  const done = milestones.filter((m) => m.status === 'done').length;
  const percent = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const upcoming = milestones.filter((m) => m.status !== 'done').slice(0, 3);
  const beads = milestones.length ? milestones.slice(0, 8) : [null, null, null, null];

  return (
    <Speakable
      as="section"
      className="rt-band rt-jy rt-R"
      listenClassName="rt-listen"
      aria-labelledby="journey-mini-title"
    >
      <Image src={JOURNEY_IMAGE} alt="" className="rt-jy-img" />
      <div className="rt-jy-body">
        <h2 id="journey-mini-title">
          <Route aria-hidden="true" />
          {t('dash.journeyTitle')}
          <span className="rt-chip">{percent}%</span>
        </h2>

        <div
          className="rt-beads"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('camino.progress')}
        >
          {beads.map((step, index) => (
            <React.Fragment key={step?.id || `bead-${index}`}>
              {index > 0 ? <span className="rt-ln" aria-hidden="true" /> : null}
              <span
                className={`rt-bd ${step?.status === 'done' ? 'rt-bd-f' : step?.status === 'in_progress' ? 'rt-bd-p' : ''}`}
                aria-hidden="true"
              />
            </React.Fragment>
          ))}
        </div>

        <p className="rt-sm">
          {done}/{milestones.length} {t('camino.steps')}
        </p>

        {upcoming.length ? (
          <ol className="rt-jy-steps">
            {upcoming.map((step) => (
              <li key={step.id}>
                <span className={`rt-dot ${step.status === 'in_progress' ? 'rt-dot-on' : ''}`} aria-hidden="true" />
                <span className={step.status === 'in_progress' ? 'font-bold' : ''}>{step.title}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rt-p">{t('camino.emptyHelp')}</p>
        )}

        <Link to="/camino" className="rt-lk">
          {t('dash.viewJourney')} →
        </Link>
      </div>
    </Speakable>
  );
}