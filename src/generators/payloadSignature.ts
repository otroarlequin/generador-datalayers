import type { CustomParam, MeasurementEvent } from '@/types';

function normalizeParams(params: CustomParam[]): Array<{ key: string; value: string }> {
  return [...params]
    .map((param) => ({
      key: param.key.trim(),
      value: param.value.trim(),
    }))
    .filter((param) => param.key.length > 0)
    .sort((a, b) => {
      const keyCompare = a.key.localeCompare(b.key);
      if (keyCompare !== 0) return keyCompare;
      return a.value.localeCompare(b.value);
    });
}

export function buildPayloadSignatureInput(event: Pick<
  MeasurementEvent,
  'event' | 'event_name' | 'eventCategory' | 'eventAction' | 'eventLabel' | 'customParams'
>): string {
  const payload = {
    event: event.event.trim(),
    event_name: event.event_name.trim(),
    eventCategory: event.eventCategory.trim(),
    eventAction: event.eventAction.trim(),
    eventLabel: event.eventLabel.trim(),
    customParams: normalizeParams(event.customParams),
  };

  return JSON.stringify(payload);
}

/** Simple deterministic hash for IndexedDB keys (FNV-1a 32-bit + hex). */
export function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildPayloadSignature(event: Pick<
  MeasurementEvent,
  'event' | 'event_name' | 'eventCategory' | 'eventAction' | 'eventLabel' | 'customParams'
>): string {
  return hashString(buildPayloadSignatureInput(event));
}
