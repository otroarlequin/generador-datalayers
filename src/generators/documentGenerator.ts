import {
  PRIORITY_LABELS_EN,
  STRUCTURE_TYPE_LABELS,
} from '@/constants';
import { generateDataLayerScript } from '@/generators/scriptGenerator';
import type { GuideDocument, MeasurementGuide, QaItem } from '@/types';
import { normalizeEvent } from '@/utils/factory';

export type DocumentLocale = 'es' | 'en' | 'pt';

const TRIGGER_LABELS: Record<string, Record<DocumentLocale, string>> = {
  button: { es: 'Botón', en: 'Button', pt: 'Botão' },
  link: { es: 'Enlace', en: 'Link', pt: 'Link' },
  banner: { es: 'Banner', en: 'Banner', pt: 'Banner' },
  form: { es: 'Formulario', en: 'Form', pt: 'Formulário' },
  popup: { es: 'Popup', en: 'Popup', pt: 'Popup' },
  menu: { es: 'Menú', en: 'Menu', pt: 'Menu' },
  checkout: { es: 'Checkout', en: 'Checkout', pt: 'Checkout' },
  other: { es: 'Otro', en: 'Other', pt: 'Outro' },
};

export function resolveQaLabel(
  item: QaItem,
  _locale: DocumentLocale,
  translate: (key: string) => string,
): string {
  if (item.label.startsWith('qa.')) {
    return translate(item.label);
  }
  return item.label;
}

function resolveTriggerElementLabel(
  value: string,
  other: string,
  locale: DocumentLocale,
): string {
  if (!value) return '—';
  if (value === 'other') return other.trim() || TRIGGER_LABELS.other[locale];
  return TRIGGER_LABELS[value]?.[locale] ?? value;
}

export function buildGuideDocument(
  guide: MeasurementGuide,
  options?: {
    locale?: DocumentLocale;
    translate?: (key: string) => string;
  },
): GuideDocument {
  const locale = options?.locale ?? 'en';
  const translate = options?.translate ?? ((key: string) => key);
  const client = guide.client.trim() || '—';
  const project = guide.project.trim() || '—';

  return {
    title: guide.title.trim() || 'Measurement Guide',
    client,
    project,
    generatedAt: new Date().toISOString(),
    index: guide.events.map((event) => {
      const normalized = normalizeEvent(event);
      return {
        id: normalized.id,
        name: normalized.name.trim() || normalized.event_name.trim() || 'Untitled event',
        structureType: normalized.structureType,
        event: normalized.event,
        event_name: normalized.event_name,
      };
    }),
    qaChecklist: guide.qaChecklist.map((item) =>
      resolveQaLabel(item, locale, translate),
    ),
    events: guide.events.map((event) => {
      const normalized = normalizeEvent(event);
      return {
        id: normalized.id,
        name: normalized.name.trim() || normalized.event_name.trim() || 'Untitled event',
        structureType: normalized.structureType,
        structureLabel: STRUCTURE_TYPE_LABELS[normalized.structureType],
        priority: normalized.priority,
        priorityLabel: PRIORITY_LABELS_EN[normalized.priority],
        interactionType: normalized.interactionType,
        description: normalized.description,
        businessObjective: normalized.businessObjective ?? '',
        client,
        project,
        screenshotDataUrl: normalized.screenshotDataUrl,
        howItTriggers: normalized.howItTriggers,
        event: normalized.event,
        event_name: normalized.event_name,
        eventCategory: normalized.eventCategory,
        eventAction: normalized.eventAction,
        eventLabel: normalized.eventLabel,
        customParams: normalized.customParams.filter((param) => param.key.trim()),
        script: generateDataLayerScript(normalized),
        technical: {
          ...normalized.technical,
          triggerElementLabel: resolveTriggerElementLabel(
            normalized.technical.triggerElement,
            normalized.technical.triggerElementOther,
            locale,
          ),
        },
      };
    }),
  };
}

export function buildGuideMarkdown(
  document: GuideDocument,
  labels: Record<string, string>,
): string {
  const lines: string[] = [];

  lines.push(`# ${document.title}`);
  lines.push('');
  lines.push(`**${labels.client}:** ${document.client}`);
  lines.push(`**${labels.project}:** ${document.project}`);
  lines.push(`**${labels.generated}:** ${document.generatedAt}`);
  lines.push('');
  lines.push(`## ${labels.index}`);
  lines.push('');
  lines.push(`| # | ${labels.name} | ${labels.type} | event | event_name |`);
  lines.push('|---:|---|---|---|---|');
  document.index.forEach((item, index) => {
    lines.push(
      `| ${index + 1} | ${item.name} | ${STRUCTURE_TYPE_LABELS[item.structureType]} | ${item.event} | ${item.event_name} |`,
    );
  });
  lines.push('');
  lines.push(`## ${labels.qa}`);
  lines.push('');
  document.qaChecklist.forEach((item) => {
    lines.push(`- [ ] ${item}`);
  });
  lines.push('');

  document.events.forEach((event, index) => {
    lines.push(`## ${index + 1}. ${event.name}`);
    lines.push('');
    lines.push(`### ${labels.general}`);
    lines.push(`- **${labels.interaction}:** ${event.interactionType}`);
    lines.push(`- **${labels.description}:** ${event.description || '—'}`);
    lines.push(`- **${labels.objective}:** ${event.businessObjective || '—'}`);
    lines.push('');
    lines.push(`### ${labels.how}`);
    lines.push(event.howItTriggers || '—');
    lines.push('');
    lines.push(`### ${labels.data}`);
    lines.push('');
    lines.push('| Campo | Valor |');
    lines.push('|---|---|');
    for (const [key, value] of [
      ['event', event.event],
      ['event_name', event.event_name],
      ['eventCategory', event.eventCategory],
      ['eventAction', event.eventAction],
      ['eventLabel', event.eventLabel],
      ...event.customParams.map((param) => [param.key, param.value] as const),
    ]) {
      lines.push(`| ${key} | ${value || '—'} |`);
    }
    lines.push('');
    lines.push(`### ${labels.script}`);
    lines.push('');
    lines.push('```javascript');
    lines.push(event.script);
    lines.push('```');
    lines.push('');
    lines.push(`### ${labels.technical}`);
    lines.push(`- **${labels.triggerCondition}:** ${event.technical.triggerCondition || '—'}`);
    lines.push(
      `- **${labels.triggerElement}:** ${event.technical.triggerElementLabel ?? '—'}`,
    );
    lines.push(`- **${labels.devNotes}:** ${event.technical.developmentNotes || '—'}`);
    if (event.technical.requiredVariables.length > 0) {
      lines.push('');
      lines.push(`| ${labels.variable} | ${labels.variableDescription} | ${labels.example} | ${labels.requiredVar} |`);
      lines.push('|---|---|---|---|');
      for (const variable of event.technical.requiredVariables) {
        lines.push(
          `| ${variable.name} | ${variable.description} | ${variable.example} | ${variable.required ? labels.yes : labels.no} |`,
        );
      }
    }
    lines.push('');
  });

  return lines.join('\n');
}
