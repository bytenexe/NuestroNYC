/** Speech engine for the read-aloud feature: prefers a feminine Mexican Spanish voice. */

const LANG_TAGS = { es: 'es-MX', en: 'en-US', fr: 'fr-FR', pt: 'pt-BR' };

const PREFERRED_LANGS = {
  es: ['es-mx', 'es-419', 'es-us', 'es-es'],
  en: ['en-us', 'en-gb'],
  fr: ['fr-fr', 'fr-ca'],
  pt: ['pt-br', 'pt-pt'],
};

const FEMALE_HINTS = [
  'mónica',
  'monica',
  'paulina',
  'sabina',
  'angélica',
  'angelica',
  'helena',
  'laura',
  'sofía',
  'sofia',
  'dalia',
  'female',
  'mujer',
  'español de méxico',
  'espanol de mexico',
  'google español',
];

let queueToken = 0;

export function speechLang(lang) {
  return LANG_TAGS[lang] || LANG_TAGS.es;
}

function isFemale(voice) {
  const name = (voice.name || '').toLowerCase();
  return FEMALE_HINTS.some((hint) => name.includes(hint));
}

export function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  if (!voices.length) return null;
  const wanted = PREFERRED_LANGS[lang] || PREFERRED_LANGS.es;
  const base = speechLang(lang).slice(0, 2);

  const ranked = voices
    .map((voice) => {
      const tag = (voice.lang || '').toLowerCase().replace('_', '-');
      const exact = wanted.indexOf(tag);
      let points = exact >= 0 ? (wanted.length - exact) * 10 : 0;
      if (!points && tag.startsWith(base)) points = 1;
      if (points && isFemale(voice)) points += 3;
      return { voice, points };
    })
    .filter((row) => row.points > 0)
    .sort((a, b) => b.points - a.points);

  return ranked[0]?.voice || null;
}

function waitForVoices(lang, ms = 900) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const timer = setTimeout(() => resolve(null), ms);
    synth.addEventListener(
      'voiceschanged',
      () => {
        clearTimeout(timer);
        resolve(pickVoice(lang));
      },
      { once: true }
    );
  });
}

function splitSentences(text) {
  const parts = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (/[.!?…]/.test(char) && current.trim().length > 40) {
      parts.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** Turns any text into sentence-sized pieces, so long pages are read without cuts. */
export function chunkText(text, max = 280) {
  const normalized = String(text || '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((line) => (/[.!?…:;]$/.test(line) ? line : `${line}.`))
    .join(' ');

  const chunks = [];
  let current = '';
  splitSentences(normalized).forEach((sentence) => {
    if (sentence.length > max) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      for (let i = 0; i < sentence.length; i += max) chunks.push(sentence.slice(i, i + max));
      return;
    }
    if (current && current.length + sentence.length + 1 > max) {
      chunks.push(current);
      current = '';
    }
    current = current ? `${current} ${sentence}` : sentence;
  });
  if (current) chunks.push(current);
  return chunks;
}

export function stopSpeech() {
  queueToken += 1;
  window.speechSynthesis?.cancel?.();
}

/** Reads a text of any length out loud, in order, until it ends or is stopped. */
export async function speakLong(text, lang = 'es', { onDone, onProgress } = {}) {
  const synth = window.speechSynthesis;
  const chunks = chunkText(text);
  if (!synth || !chunks.length) {
    onDone?.();
    return;
  }

  const current = ++queueToken;
  let voice = pickVoice(lang);
  if (!voice && !synth.getVoices().length) voice = await waitForVoices(lang);
  if (current !== queueToken) return;

  let index = 0;
  const speakNext = () => {
    if (current !== queueToken) return;
    if (index >= chunks.length) {
      onDone?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = voice?.lang || speechLang(lang);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.12;
    utterance.onend = () => {
      index += 1;
      onProgress?.(index, chunks.length);
      speakNext();
    };
    utterance.onerror = () => onDone?.();
    synth.speak(utterance);
  };

  synth.cancel();
  setTimeout(speakNext, 60);
}