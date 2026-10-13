export const DOC_TYPES = [
  'daca',
  'work_permit',
  'green_card',
  'passport',
  'visa',
  'residency_card',
  'citizenship_application',
  'birth_certificate',
  'tax_record',
  'legal_document',
  'other',
];

export const CORE_DOC_TYPES = ['passport', 'work_permit', 'green_card', 'daca', 'tax_record', 'birth_certificate'];

export const BOROUGHS = ['queens', 'bronx', 'brooklyn', 'manhattan', 'staten_island'];

export const SERVICE_TYPES = [
  'citizenship',
  'daca',
  'asylum',
  'family_petition',
  'removal_defense',
  'work_permit',
  'victim_services',
  'counseling',
  'self_defense',
  'general',
  'workshops',
];

export const COST_TYPES = ['free', 'sliding_scale', 'affordable', 'paid'];

export const MODALITIES = ['in_person', 'virtual', 'both'];

export const LANGUAGES = ['Español', 'English', 'Español/English'];

export const STAGES = ['eligibility', 'application', 'biometrics', 'interview', 'decision', 'renewal', 'citizenship', 'other'];

export const ALERT_CATEGORIES = ['policy', 'clinic', 'aid', 'resource'];

export const FOOD_TYPES = ['food_bank', 'pantry', 'hot_meals', 'snap_friendly', 'community_farm'];

export const FOOD_TYPE_KEYS = {
  food_bank: 'food.typeBank',
  pantry: 'food.typePantry',
  hot_meals: 'food.typeHotMeals',
  snap_friendly: 'food.typeSnap',
  community_farm: 'food.typeFarm',
};

export const JOURNEY_TEMPLATES = [
  {
    id: 'daca',
    name: { es: 'DACA: renovación a residencia', en: 'DACA: renewal to residency' },
    milestones: [
      { es: 'Revisar elegibilidad para renovar DACA', en: 'Review DACA renewal eligibility', stage: 'eligibility' },
      { es: 'Reunir documentos y comprobantes de residencia', en: 'Gather documents and proof of residency', stage: 'application' },
      { es: 'Enviar la solicitud de renovación (I-821D)', en: 'Submit renewal application (I-821D)', stage: 'application' },
      { es: 'Biométricos y permiso de trabajo', en: 'Biometrics and work permit', stage: 'biometrics' },
      { es: 'Explorar opciones de residencia permanente', en: 'Explore permanent residency options', stage: 'renewal' },
    ],
  },
  {
    id: 'visa_to_green_card',
    name: { es: 'Visa → Residencia → Ciudadanía', en: 'Visa → Residency → Citizenship' },
    milestones: [
      { es: 'Confirmar categoría de visa', en: 'Confirm visa category', stage: 'eligibility' },
      { es: 'Petición familiar aprobada', en: 'Family petition approved', stage: 'application' },
      { es: 'Ajuste de estatus (I-485)', en: 'Adjustment of status (I-485)', stage: 'application' },
      { es: 'Entrevista en la oficina de inmigración', en: 'Immigration office interview', stage: 'interview' },
      { es: 'Recibir la Green Card', en: 'Receive the Green Card', stage: 'decision' },
      { es: 'Aplicar para la ciudadanía (N-400)', en: 'Apply for citizenship (N-400)', stage: 'citizenship' },
    ],
  },
  {
    id: 'green_card_to_citizen',
    name: { es: 'Residencia → Ciudadanía', en: 'Residency → Citizenship' },
    milestones: [
      { es: 'Cumplir el tiempo de residencia requerido', en: 'Meet the required residency time', stage: 'eligibility' },
      { es: 'Enviar la solicitud N-400', en: 'Submit the N-400 application', stage: 'application' },
      { es: 'Biométricos y estudio del caso', en: 'Biometrics and case review', stage: 'biometrics' },
      { es: 'Examen de educación cívica y entrevista', en: 'Civics exam and interview', stage: 'interview' },
      { es: 'Ceremonia de juramento', en: 'Oath ceremony', stage: 'citizenship' },
    ],
  },
];

export const EMERGENCY_CHECKLIST = [
  { es: 'Fotos o copias de documentos importantes guardadas', en: 'Photos or copies of key documents stored' },
  { es: 'Contactos de confianza agregados', en: 'Trusted contacts added' },
  { es: 'Número de tu abogado guardado', en: "Your attorney's number saved" },
  { es: 'Plan familiar compartido con la familia', en: 'Family plan shared with the family' },
  { es: 'Paquete médico actualizado', en: 'Medical packet up to date' },
];

export const DEADLINE_WINDOW_DAYS = 180;

export function tLabel(entry, lang) {
  if (!entry) return '';
  return entry[lang] || entry.es || '';
}