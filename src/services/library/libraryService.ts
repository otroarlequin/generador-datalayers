import { LIBRARY_STORE } from '@/constants';
import { buildPayloadSignature } from '@/generators/payloadSignature';
import { generateDataLayerScript } from '@/generators/scriptGenerator';
import { getDb } from '@/services/storage/db';
import type {
  LibraryEvent,
  LibraryFilters,
  MeasurementEvent,
  MeasurementGuide,
} from '@/types';
import { createId, normalizeEvent, nowIso } from '@/utils/factory';

type LegacyLibrary = LibraryEvent & {
  client?: string;
  project?: string;
};

function toLibraryEvent(
  event: MeasurementEvent,
  guide: MeasurementGuide,
  existing?: LibraryEvent,
): LibraryEvent {
  const timestamp = nowIso();
  const normalized = normalizeEvent(event);
  return {
    ...normalized,
    id: existing?.id ?? createId(),
    signature: buildPayloadSignature(normalized),
    brand: guide.brand.trim() || '—',
    country: guide.country.trim() || '—',
    script: generateDataLayerScript(normalized),
    author: existing?.author,
    createdAt: existing?.createdAt ?? normalized.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

function normalizeLibraryEvent(event: LegacyLibrary): LibraryEvent {
  const normalized = normalizeEvent(event);
  return {
    ...normalized,
    signature: event.signature,
    brand: event.brand ?? event.client ?? '—',
    country: event.country ?? event.project ?? '—',
    script: event.script || generateDataLayerScript(normalized),
    author: event.author,
  };
}

export async function listLibraryEvents(): Promise<LibraryEvent[]> {
  const db = await getDb();
  const events = await db.getAll(LIBRARY_STORE);
  return events
    .map((event) => normalizeLibraryEvent(event as LegacyLibrary))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getLibraryEventById(
  id: string,
): Promise<LibraryEvent | undefined> {
  const db = await getDb();
  const event = await db.get(LIBRARY_STORE, id);
  if (!event) return undefined;
  return normalizeLibraryEvent(event as LegacyLibrary);
}

export async function upsertLibraryEventFromGuide(
  event: MeasurementEvent,
  guide: MeasurementGuide,
): Promise<LibraryEvent> {
  const db = await getDb();
  const signature = buildPayloadSignature(event);
  const existing = await db.getFromIndex(LIBRARY_STORE, 'by-signature', signature);
  const next = toLibraryEvent(
    event,
    guide,
    existing ? normalizeLibraryEvent(existing as LegacyLibrary) : undefined,
  );
  await db.put(LIBRARY_STORE, next);
  return next;
}

export async function upsertGuideEventsToLibrary(
  guide: MeasurementGuide,
): Promise<LibraryEvent[]> {
  const results: LibraryEvent[] = [];
  for (const event of guide.events) {
    results.push(await upsertLibraryEventFromGuide(event, guide));
  }
  return results;
}

export async function saveEventToLibrary(
  event: MeasurementEvent,
  guide: MeasurementGuide,
): Promise<LibraryEvent> {
  return upsertLibraryEventFromGuide(event, guide);
}

export async function saveLibraryEvent(
  event: LibraryEvent,
): Promise<LibraryEvent> {
  const db = await getDb();
  const normalized = normalizeEvent(event);
  const signature = buildPayloadSignature(normalized);
  const conflict = await db.getFromIndex(LIBRARY_STORE, 'by-signature', signature);

  const next: LibraryEvent = {
    ...normalized,
    signature,
    brand: event.brand,
    country: event.country,
    script: generateDataLayerScript(normalized),
    author: event.author,
    updatedAt: nowIso(),
  };

  if (conflict && conflict.id !== event.id) {
    next.id = conflict.id;
    next.createdAt = conflict.createdAt;
    next.author = conflict.author;
    await db.put(LIBRARY_STORE, next);
    await db.delete(LIBRARY_STORE, event.id);
    return next;
  }

  await db.put(LIBRARY_STORE, next);
  return next;
}

export async function deleteLibraryEvent(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(LIBRARY_STORE, id);
}

export async function duplicateLibraryEvent(
  id: string,
): Promise<LibraryEvent | undefined> {
  const existing = await getLibraryEventById(id);
  if (!existing) return undefined;

  const timestamp = nowIso();
  const copy: LibraryEvent = {
    ...normalizeEvent({
      ...existing,
      id: createId(),
      name: `${existing.name || existing.event_name} (copy)`,
      event_name: existing.event_name
        ? `${existing.event_name}_copy`
        : existing.event_name,
      customParams: existing.customParams.map((param) => ({
        ...param,
        id: createId(),
      })),
      requiredVariables: existing.requiredVariables.map((variable) => ({
        ...variable,
        id: createId(),
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    signature: '',
    brand: existing.brand,
    country: existing.country,
    script: '',
    author: existing.author,
  };

  copy.signature = buildPayloadSignature(copy);
  copy.script = generateDataLayerScript(copy);

  const db = await getDb();
  const conflict = await db.getFromIndex(LIBRARY_STORE, 'by-signature', copy.signature);
  if (conflict) {
    copy.eventLabel = `${copy.eventLabel || 'copy'}_${Date.now()}`;
    copy.signature = buildPayloadSignature(copy);
    copy.script = generateDataLayerScript(copy);
  }

  await db.put(LIBRARY_STORE, copy);
  return copy;
}

export function filterLibraryEvents(
  events: LibraryEvent[],
  filters: LibraryFilters,
): LibraryEvent[] {
  const query = filters.query.trim().toLowerCase();
  const brand = filters.brand.trim().toLowerCase();
  const country = filters.country.trim().toLowerCase();

  return events.filter((event) => {
    if (brand && event.brand.toLowerCase() !== brand) return false;
    if (country && event.country.toLowerCase() !== country) return false;
    if (filters.structureType && event.structureType !== filters.structureType) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      event.name,
      event.description,
      event.event,
      event.event_name,
      event.eventCategory,
      event.eventAction,
      event.eventLabel,
      event.brand,
      event.country,
      event.howItTriggers,
      ...event.customParams.map((param) => `${param.key} ${param.value}`),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}
