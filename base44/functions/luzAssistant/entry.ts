import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const DISCLAIMER_ES =
  'Esta asistente ofrece información educativa únicamente y no constituye asesoría legal. Consulta con un abogado de inmigración calificado.';
const DISCLAIMER_EN =
  'This assistant provides educational information only and is not legal advice. Please consult a qualified immigration attorney.';

const DOC_TYPES = [
  'daca', 'work_permit', 'green_card', 'passport', 'visa', 'residency_card',
  'citizenship_application', 'birth_certificate', 'tax_record', 'legal_document', 'other',
];

const LANGUAGE_NAMES = { es: 'Spanish', en: 'English', fr: 'French', pt: 'Brazilian Portuguese' };
const UI_LANGS = ['es', 'en', 'fr', 'pt'];

function disclaimerFor(lang) {
  return lang === 'en' ? DISCLAIMER_EN : DISCLAIMER_ES;
}

function buildChatPrompt({ question, history, context, lang }) {
  const answerLanguage = LANGUAGE_NAMES[lang] || 'Spanish';
  const lines = [
    'You are "Luz", the AI guide inside NuestroNYC, a free readiness platform for immigrants and mixed-status families in New York City (Queens, Bronx, Brooklyn, Manhattan, Staten Island).',
    'Your users may have limited literacy, may be undocumented, and are often anxious. Be warm, calm and reassuring. Never judgmental.',
    '',
    'HOW TO ANSWER:',
    `- Answer in ${answerLanguage}. If the user writes in another language than that, still answer in ${answerLanguage}.`,
    lang === 'es'
      ? '- Use plain Spanish at a 6th-grade reading level. Explain any term in English forms (like "ajuste de estatus") in parentheses. Keep sentences short.'
      : '- Use plain English at a 6th-grade reading level. Keep sentences short.',
    '- Be concrete and practical. When listing documents, use a short bulleted list of the exact documents or forms (I-821D, I-765, I-485, N-400, etc.) and say who usually needs them.',
    '- Never invent deadlines, fees, phone numbers or case outcomes. If something depends on current USCIS policy or the person\'s specific case, say so clearly and point to uscis.gov or a free legal provider.',
    '- You provide education, not legal advice. For anything that is a decision about their case, recommend speaking with a qualified immigration attorney or a free legal aid organization (CUNY Citizenship Now, Legal Aid Society, Make the Road New York, Catholic Charities).',
    '- Only if the message clearly describes an emergency (detention, ICE at the door, a deportation order, or a deadline that has already passed) start with 2-4 short safety steps: the right to remain silent, the right to speak with an attorney, and calling a legal hotline right away. For ordinary questions about forms, renewals or eligibility, do not bring up ICE, detention or emergency steps.',
    '- When it is useful, close with one short question that helps you give a better answer next time.',
    '- Maximum 250 words. No markdown headings. Plain paragraphs and simple "-" bullets only.',
  ];

  if (context) {
    lines.push('', 'WHAT THE PLATFORM KNOWS ABOUT THIS FAMILY (from their saved records):', context);
  }
  if (history.length) {
    lines.push('', 'RECENT CONVERSATION:');
    history.forEach((m) => lines.push(`${m.role === 'user' ? 'User' : 'Luz'}: ${m.content}`));
  }
  lines.push('', 'USER QUESTION:', question, '', 'Answer as Luz.');
  return lines.join('\n');
}

function buildTranslatePrompt({ text, targetLang }) {
  const target = LANGUAGE_NAMES[targetLang] || 'Spanish';
  return [
    `Translate the following text into ${target}.`,
    'Rules: keep names, dates, form numbers and legal terms accurate. Keep the original meaning and structure. If a legal term has no everyday equivalent, give a short plain-language explanation in parentheses.',
    'Return only the translation, no introduction.',
    '',
    'TEXT:',
    text,
  ].join('\n');
}

function buildAnalysisPrompt({ lang }) {
  const language = LANGUAGE_NAMES[lang] || 'Spanish';
  return [
    'You are Luz, the immigration document assistant of NuestroNYC. Read the attached immigration document (photo or PDF) and return structured data.',
    `Write the "title" and "summary" fields in ${language}, in plain language at a 6th-grade reading level.`,
    'Detect the document type from this list: ' + DOC_TYPES.join(', ') + '.',
    'Find the most important dates: issue date, expiration date, receipt/notice date, and any appointment date. Use ISO format YYYY-MM-DD when you can read a date confidently; otherwise leave the field empty.',
    'Never guess a date or a number you cannot read. If a date is unreadable, leave it empty.',
    'In "summary", explain what this document is, why it matters, and one practical next step for the person (for example, when to renew).',
    'Do not give legal advice; recommend consulting an attorney for decisions about their case.',
  ].join('\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const mode = typeof body?.mode === 'string' ? body.mode : 'chat';
    const lang = body?.lang === 'en' ? 'en' : 'es';
    const answerLang = UI_LANGS.includes(body?.ui_lang) ? body.ui_lang : lang;

    if (mode === 'chat') {
      const question = String(body?.question || '').slice(0, 1500).trim();
      if (!question) return Response.json({ error: 'Missing question' }, { status: 400 });
      const context = String(body?.context || '').slice(0, 900);
      const history = Array.isArray(body?.history)
        ? body.history
            .slice(-8)
            .filter((m) => m && typeof m.content === 'string')
            .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 800) }))
        : [];

      const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildChatPrompt({ question, history, context, lang: answerLang }),
      });
      return Response.json({ answer: typeof answer === 'string' ? answer : String(answer), disclaimer: disclaimerFor(lang) });
    }

    if (mode === 'translate') {
      const text = String(body?.text || '').slice(0, 6000).trim();
      const fileUrl = typeof body?.file_url === 'string' && body.file_url.startsWith('http') ? body.file_url.slice(0, 2000) : '';
      if (!text && !fileUrl) return Response.json({ error: 'Missing text or file' }, { status: 400 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: fileUrl
          ? buildTranslatePrompt({ text: '(see attached document)', targetLang: answerLang }) +
            ' The text to translate is inside the attached document.'
          : buildTranslatePrompt({ text, targetLang: answerLang }),
        file_urls: fileUrl ? [fileUrl] : undefined,
      });
      return Response.json({ translation: typeof result === 'string' ? result : String(result) });
    }

    if (mode === 'analyze_document') {
      const fileUrl = typeof body?.file_url === 'string' && body.file_url.startsWith('http') ? body.file_url.slice(0, 2000) : '';
      if (!fileUrl) return Response.json({ error: 'Missing file' }, { status: 400 });

      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          doc_type: { type: 'string', enum: DOC_TYPES },
          summary: { type: 'string' },
          issue_date: { type: 'string' },
          expiry_date: { type: 'string' },
          other_dates: { type: 'string' },
          next_step: { type: 'string' },
        },
        required: ['title', 'doc_type', 'summary'],
      };

      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: buildAnalysisPrompt({ lang: answerLang }),
        file_urls: [fileUrl],
        response_json_schema: schema,
      });
      return Response.json({ analysis, disclaimer: disclaimerFor(lang) });
    }

    return Response.json({ error: 'Unsupported mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}