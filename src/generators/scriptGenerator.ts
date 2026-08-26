import type { MeasurementEvent } from '@/types';

function formatValue(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function buildDataLayerPayload(event: MeasurementEvent): Record<string, string> {
  const payload: Record<string, string> = {
    event: event.event.trim() || 'event',
    event_name: event.event_name.trim(),
    eventCategory: event.eventCategory.trim(),
    eventAction: event.eventAction.trim(),
    eventLabel: event.eventLabel.trim(),
  };

  for (const param of event.customParams) {
    const key = param.key.trim();
    if (!key) continue;
    payload[key] = param.value.trim();
  }

  return payload;
}

export function generateDataLayerScript(
  event: MeasurementEvent,
  options?: { includeDictionaryExamples?: boolean },
): string {
  const includeDictionaryExamples = options?.includeDictionaryExamples ?? false;
  const payload = buildDataLayerPayload(event);
  const lines: string[] = [];

  const keys = Object.keys(payload);
  keys.forEach((key, index) => {
    const suffix = index < keys.length - 1 ? ',' : '';
    lines.push(`  ${key}: ${formatValue(payload[key])}${suffix}`);
  });

  if (includeDictionaryExamples) {
    for (const variable of event.technical.requiredVariables) {
      const name = variable.name.trim();
      if (!name) continue;
      if (lines.length > 0) {
        lines[lines.length - 1] += ',';
      }
      lines.push(`  ${name}: ${formatValue(variable.example.trim() || '')}`);
    }
  }

  return `dataLayer.push({\n${lines.join('\n')}\n});`;
}
