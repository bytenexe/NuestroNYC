import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { usePrefs } from '@/lib/PreferencesContext';
import Speakable from '@/components/common/Speakable';
import { Image } from '@/components/ui/image';

const SAVED_IMAGE =
  'https://media.base44.com/images/public/6aca6b70e540702ef09fed45/b236c2e7b_generated_3e237d61.jpg';

export default function SavedBand({ saved }) {
  const { t } = usePrefs();

  return (
    <Speakable
      as="section"
      className="rt-band rt-sv rt-L"
      listenClassName="rt-listen"
      aria-labelledby="saved-title"
    >
      <h2 id="saved-title">
        <Bookmark aria-hidden="true" />
        {t('dash.savedTitle')}
      </h2>

      {!saved.length ? (
        <div className="rt-pill">
          <Image src={SAVED_IMAGE} alt="" className="rt-pill-img" />
          <div>
            <b>{t('dash.noSaved')}</b>
          </div>
        </div>
      ) : (
        <ul className="rt-list">
          {saved.slice(0, 4).map((item) => (
            <li key={item.id} className="rt-pill">
              <Image src={SAVED_IMAGE} alt="" className="rt-pill-img" />
              <div>
                <b>{item.name}</b>
                {item.subtitle ? <span>{item.subtitle}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to="/legal" className="rt-lk">
        {t('nav.legal')} →
      </Link>
    </Speakable>
  );
}