import { base44 } from '@/api/base44Client';
import { NAV_ITEMS } from '@/components/nav/navItems';

export const SECTION_KEYWORDS = {
  '/': 'inicio dashboard preparación readiness score',
  '/documents': 'documentos bóveda pasaporte permiso green card daca vault',
  '/assistant': 'luz asistente preguntas ai chat assistant',
  '/camino': 'camino trámites etapas progreso journey milestones',
  '/legal': 'abogado legal ayuda gratis organizaciones attorney',
  '/community': 'comunidad alertas eventos derechos events alerts',
  '/food': 'alimentos comida despensa banco snap food bank pantry',
  '/emergency': 'emergencia contactos plan médico kit',
  '/settings': 'ajustes configuración accesibilidad idioma',
};

function regex(value) {
  return { $regex: value, $options: 'i' };
}

async function safeItems(promise, limit) {
  try {
    const page = await promise;
    return (page?.items || []).slice(0, limit);
  } catch {
    return [];
  }
}

export function matchSections(query, t) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return NAV_ITEMS.filter((item) => {
    const label = `${t(item.key)} ${t(item.key)}`.toLowerCase();
    const keywords = SECTION_KEYWORDS[item.to] || '';
    return label.includes(needle) || item.to.includes(needle) || keywords.includes(needle);
  }).map((item) => ({
    id: `section-${item.to}`,
    title: t(item.key),
    subtitle: t('search.open'),
    to: item.to,
    icon: item.icon,
  }));
}

/**
 * Runs the app-wide search across public content and, when the person has an
 * account, their own records too.
 */
export async function runSearch(query, t, { limit = 5, includePersonal = true } = {}) {
  const needle = query.trim();
  if (!needle) return [];

  const groups = [];

  const [documents, milestones, reminders, contacts] = includePersonal
    ? await Promise.all([
        safeItems(
          base44.entities.Document.filter(
            { $or: [{ title: regex(needle) }, { notes: regex(needle) }] },
            { limit, sort: '-created_date' }
          ),
          limit
        ),
        safeItems(base44.entities.JourneyMilestone.filter({ title: regex(needle) }, { limit, sort: 'order_index' }), limit),
        safeItems(base44.entities.Reminder.filter({ title: regex(needle) }, { limit, sort: 'due_date' }), limit),
        safeItems(base44.entities.TrustedContact.filter({ name: regex(needle) }, { limit }), limit),
      ])
    : [[], [], [], []];

  const [guides, providers, food, events, alerts] = await Promise.all([
    safeItems(
      base44.entities.Resource.filter(
        { $or: [{ title_es: regex(needle) }, { title_en: regex(needle) }, { summary_es: regex(needle) }] },
        { limit }
      ),
      limit
    ),
    safeItems(
      base44.entities.LegalProvider.filter(
        { $or: [{ name: regex(needle) }, { description_es: regex(needle) }, { services: regex(needle) }] },
        { limit, sort: 'name' }
      ),
      limit
    ),
    safeItems(
      base44.entities.FoodResource.filter(
        { $or: [{ name: regex(needle) }, { description_es: regex(needle) }, { address: regex(needle) }] },
        { limit, sort: 'name' }
      ),
      limit
    ),
    safeItems(
      base44.entities.Event.filter({ $or: [{ title_es: regex(needle) }, { title_en: regex(needle) }, { org_name: regex(needle) }] }, { limit }),
      limit
    ),
    safeItems(
      base44.entities.CommunityAlert.filter({ $or: [{ title_es: regex(needle) }, { title_en: regex(needle) }] }, { limit, sort: '-published_date' }),
      limit
    ),
  ]);

  const personal = [
    ...documents.map((doc) => ({ id: doc.id, title: doc.title, subtitle: t(`doc.${doc.doc_type}`), to: '/documents' })),
    ...milestones.map((item) => ({ id: item.id, title: item.title, subtitle: t(`stage.${item.stage}`), to: '/camino' })),
    ...reminders.map((item) => ({ id: item.id, title: item.title, subtitle: t('common.deadline'), to: '/emergency' })),
    ...contacts.map((item) => ({ id: item.id, title: item.name, subtitle: item.relationship, to: '/emergency' })),
  ];
  if (personal.length) groups.push({ key: 'personal', label: t('search.personal'), items: personal });

  if (guides.length) {
    groups.push({
      key: 'guides',
      label: t('search.guides'),
      items: guides.map((item) => ({
        id: item.id,
        title: item.title_es,
        titleEn: item.title_en,
        subtitle: item.summary_es,
        subtitleEn: item.summary_en,
        to: '/community',
      })),
    });
  }

  if (providers.length) {
    groups.push({
      key: 'legal',
      label: t('search.legal'),
      items: providers.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.address || item.boroughs?.[0],
        to: '/legal',
      })),
    });
  }

  if (food.length) {
    groups.push({
      key: 'food',
      label: t('search.food'),
      items: food.map((item) => ({ id: item.id, title: item.name, subtitle: item.address, to: '/food' })),
    });
  }

  if (events.length) {
    groups.push({
      key: 'events',
      label: t('search.events'),
      items: events.map((item) => ({
        id: item.id,
        title: item.title_es,
        titleEn: item.title_en,
        subtitle: item.org_name,
        to: '/community',
      })),
    });
  }

  if (alerts.length) {
    groups.push({
      key: 'alerts',
      label: t('search.alerts'),
      items: alerts.map((item) => ({
        id: item.id,
        title: item.title_es,
        titleEn: item.title_en,
        subtitle: item.source_org,
        to: '/community',
      })),
    });
  }

  return groups;
}