import {
  PRIORITY_LABELS_EN,
  STRUCTURE_TYPE_LABELS,
} from '@/constants';
import { generateDataLayerScript } from '@/generators/scriptGenerator';
import type { GuideDocument, MeasurementGuide } from '@/types';
import { normalizeEvent } from '@/utils/factory';

export type DocumentLocale = 'es' | 'en' | 'pt';

export function buildGuideDocument(guide: MeasurementGuide): GuideDocument {
  const brand = guide.brand.trim() || '—';
  const country = guide.country.trim() || '—';

  return {
    title: guide.title.trim() || 'Measurement Guide',
    brand,
    country,
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
        brand,
        country,
        screenshotDataUrl: normalized.screenshotDataUrl,
        howItTriggers: normalized.howItTriggers,
        event: normalized.event,
        event_name: normalized.event_name,
        eventCategory: normalized.eventCategory,
        eventAction: normalized.eventAction,
        eventLabel: normalized.eventLabel,
        customParams: normalized.customParams.filter((param) => param.key.trim()),
        script: generateDataLayerScript(normalized),
        requiredVariables: normalized.requiredVariables,
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
  lines.push(`**${labels.brand}:** ${document.brand}`);
  lines.push(`**${labels.country}:** ${document.country}`);
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
    if (event.requiredVariables.length > 0) {
      lines.push(`### ${labels.dictionary}`);
      lines.push('');
      lines.push(`| ${labels.variable} | ${labels.variableDescription} | ${labels.example} | ${labels.requiredVar} |`);
      lines.push('|---|---|---|---|');
      for (const variable of event.requiredVariables) {
        lines.push(
          `| ${variable.name} | ${variable.description} | ${variable.example} | ${variable.required ? labels.yes : labels.no} |`,
        );
      }
      lines.push('');
    }
  });

  return lines.join('\n');
}
