import { parseISO, differenceInDays } from 'date-fns';
import { CORE_DOC_TYPES, DEADLINE_WINDOW_DAYS } from '@/lib/constants';

const MONTHS = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
};

export function parseDate(value) {
  if (!value) return null;
  const date = parseISO(String(value).slice(0, 10));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, lang = 'es') {
  const date = parseDate(value);
  if (!date) return '';
  const months = MONTHS[lang] || MONTHS.es;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function daysUntil(value) {
  const date = parseDate(value);
  if (!date) return null;
  return differenceInDays(date, new Date());
}

export function expiryState(value) {
  const days = daysUntil(value);
  if (days === null) return { state: 'none', days: null };
  if (days < 0) return { state: 'expired', days };
  if (days <= DEADLINE_WINDOW_DAYS) return { state: 'expiring', days };
  return { state: 'valid', days };
}

const STATUS_TYPES = ['daca', 'green_card', 'visa', 'residency_card', 'work_permit'];

function item(es, en, ok, points) {
  return { label: { es, en }, ok, points };
}

export function computeReadiness({ documents = [], milestones = [], contacts = [], plan = null, savedCount = 0 }) {
  const hasType = (type) => documents.some((doc) => doc.doc_type === type);
  const hasExpired = documents.some((doc) => expiryState(doc.expiry_date).state === 'expired');

  const checks = [
    item('Documento de estatus guardado (DACA, Green Card, visa o permiso de trabajo)', 'Status document stored (DACA, Green Card, visa or work permit)', documents.some((doc) => STATUS_TYPES.includes(doc.doc_type)), 20),
    item('Pasaporte subido', 'Passport uploaded', hasType('passport'), 15),
    item('Registros de impuestos agregados', 'Tax records added', hasType('tax_record'), 10),
    item('Acta de nacimiento agregada', 'Birth certificate added', hasType('birth_certificate'), 5),
    item('Ningún documento vencido', 'No expired documents', documents.length > 0 && !hasExpired, 10),
    item('Al menos un paso de Mi Camino completado', 'At least one Mi Camino step completed', milestones.some((m) => m.status === 'done'), 10),
    item('Tu camino tiene 3 pasos o más', 'Your journey has 3 or more steps', milestones.length >= 3, 5),
    item('Dos contactos de confianza agregados', 'Two trusted contacts added', contacts.length >= 2, 10),
    item('Plan familiar de emergencia creado', 'Family emergency plan created', !!plan, 10),
    item('Una organización de ayuda guardada', 'A legal help organization saved', savedCount > 0, 5),
  ];

  const score = checks.reduce((total, check) => total + (check.ok ? check.points : 0), 0);
  const completed = checks.filter((c) => c.ok).map((c) => c.label);
  const missing = checks.filter((c) => !c.ok).map((c) => c.label);

  const recommendations = [];
  const expiring = documents
    .map((doc) => ({ doc, exp: expiryState(doc.expiry_date) }))
    .filter((row) => row.exp.state === 'expired' || row.exp.state === 'expiring')
    .sort((a, b) => a.exp.days - b.exp.days);

  if (expiring.length) {
    const first = expiring[0];
    recommendations.push({
      es: `Revisa "${first.doc.title}": vence el ${formatDate(first.doc.expiry_date, 'es')}.`,
      en: `Review "${first.doc.title}": it expires on ${formatDate(first.doc.expiry_date, 'en')}.`,
    });
  }
  const missingCore = CORE_DOC_TYPES.filter((type) => !hasType(type)).slice(0, 2);
  if (missingCore.length) {
    recommendations.push({
      es: 'Sube los documentos que te faltan para completar tu expediente.',
      en: 'Upload the documents you are missing to complete your file.',
    });
  }
  if (contacts.length < 2) {
    recommendations.push({
      es: 'Agrega dos contactos de confianza en tu kit de emergencia.',
      en: 'Add two trusted contacts in your emergency kit.',
    });
  }
  if (!plan) {
    recommendations.push({
      es: 'Crea tu plan familiar con un punto de encuentro.',
      en: 'Create your family plan with a meeting place.',
    });
  }
  if (!savedCount) {
    recommendations.push({
      es: 'Guarda una organización de ayuda legal cercana.',
      en: 'Save a legal help organization near you.',
    });
  }
  if (!milestones.length) {
    recommendations.push({
      es: 'Empieza Mi Camino con una plantilla de ruta.',
      en: 'Start Mi Camino with a journey template.',
    });
  }
  if (milestones.length && milestones.every((m) => m.status === 'done')) {
    recommendations.push({
      es: '¡Completaste todos tus pasos! Revisa con un abogado el siguiente trámite.',
      en: 'You completed all your steps! Review the next process with an attorney.',
    });
  }

  return { score, completed, missing, recommendations: recommendations.slice(0, 4), missingCore, checks };
}

export function collectDeadlines({ documents = [], reminders = [] }) {
  const rows = [];
  documents.forEach((doc) => {
    const { state, days } = expiryState(doc.expiry_date);
    if (!doc.expiry_date || state === 'valid') return;
    rows.push({ id: `doc-${doc.id}`, title: doc.title, kindLabel: { es: 'Documento', en: 'Document' }, date: doc.expiry_date, days, urgent: state === 'expired' });
  });
  reminders.forEach((reminder) => {
    if (reminder.status === 'done') return;
    const days = daysUntil(reminder.due_date);
    if (days === null) return;
    rows.push({ id: `rem-${reminder.id}`, title: reminder.title, kindLabel: { es: 'Recordatorio', en: 'Reminder' }, date: reminder.due_date, days, urgent: days < 0 });
  });
  return rows.sort((a, b) => a.days - b.days);
}

export function scoreLabelKey(score) {
  if (score >= 85) return 'score.excellent';
  if (score >= 65) return 'score.good';
  if (score >= 40) return 'score.fair';
  return 'score.low';
}