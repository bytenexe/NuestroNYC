import React from 'react';
import { usePrefs } from '@/lib/PreferencesContext';
import FlagGlyphs from '@/components/common/FlagGlyphs';

const FLAGS = [
  ['flagAr', 'Argentina'],
  ['flagBo', 'Bolivia'],
  ['flagBr', 'Brasil'],
  ['flagCl', 'Chile'],
  ['flagCo', 'Colombia'],
  ['flagCr', 'Costa Rica'],
  ['flagCu', 'Cuba'],
  ['flagEc', 'Ecuador'],
  ['flagSv', 'El Salvador'],
  ['flagGt', 'Guatemala'],
  ['flagHt', 'Haití'],
  ['flagHn', 'Honduras'],
  ['flagMx', 'México'],
  ['flagNi', 'Nicaragua'],
  ['flagPa', 'Panamá'],
  ['flagPy', 'Paraguay'],
  ['flagPe', 'Perú'],
  ['flagPr', 'Puerto Rico'],
  ['flagDo', 'República Dominicana'],
  ['flagUy', 'Uruguay'],
  ['flagVe', 'Venezuela'],
];

// The strip is repeated so it loops without gaps. Only the first copy is read out.
const SETS = [0, 1, 2, 3];

export default function FlagBanner() {
  const { t } = usePrefs();
  const label = t('flags.label');

  return (
    <>
      <FlagGlyphs />
      <div className="r-flags" role="img" aria-label={label}>
        <ul className="r-flags-track">
          {SETS.map((set) =>
            FLAGS.map(([id, country]) => (
              <li key={`${set}-${id}`} title={country} aria-hidden={set > 0 ? 'true' : undefined}>
                <svg className="r-flag" viewBox="0 0 30 20" aria-hidden="true">
                  <use href={`#${id}`} />
                </svg>
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="r-rule" aria-hidden="true" />
    </>
  );
}