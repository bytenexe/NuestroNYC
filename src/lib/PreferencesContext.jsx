import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translate, contentLang, LANGUAGE_OPTIONS } from '@/lib/strings';

const STORAGE_KEY = 'raices.prefs.v1';
const LANGS = LANGUAGE_OPTIONS.map((option) => option.code);

const DEFAULTS = {
  lang: 'es',
  fontsize: 'normal',
  dyslexia: false,
  highContrast: false,
  visualNotifications: false,
  readAloud: true,
  householdCode: '',
  displayName: '',
  borough: 'queens',
};

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `FAM-${out}`;
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      stored = {};
    }
    const merged = { ...DEFAULTS, ...stored };
    if (!merged.householdCode) merged.householdCode = makeCode();
    if (!LANGS.includes(merged.lang)) merged.lang = DEFAULTS.lang;
    return merged;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    document.documentElement.lang = prefs.lang;
    document.documentElement.dataset.fontsize = prefs.fontsize;
    document.body.classList.toggle('dyslexia', !!prefs.dyslexia);
    document.body.classList.toggle('high-contrast', !!prefs.highContrast);
    document.body.classList.toggle('visual-notifications', !!prefs.visualNotifications);
  }, [prefs]);

  const value = useMemo(
    () => ({
      prefs: { ...prefs, contentLang: contentLang(prefs.lang) },
      householdCode: prefs.householdCode,
      contentLang: contentLang(prefs.lang),
      update: (patch) => setPrefs((p) => ({ ...p, ...patch })),
      languages: LANGUAGE_OPTIONS,
      t: (key) => translate(prefs.lang, key),
      tFor: (key, lang) => translate(lang, key),
    }),
    [prefs]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePrefs must be used inside PreferencesProvider');
  return ctx;
}

export function newHouseholdCode() {
  return makeCode();
}