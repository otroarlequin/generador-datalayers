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
    client: guide.client.trim() || 'No client',
    project: guide.project.trim() || 'No project',
    script: generateDataLayerScript(normalized),
    author: existing?.author,
    createdAt: existing?.createdAt ?? normalized.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

export async function listLibraryEvents(): Promise<LibraryEvent[]> {
  const db = await getDb();
  const events = await db.getAll(LIBRARY_STORE);
  return events
    .map((event) => ({
      ...normalizeEvent(event),
      signature: event.signature,
      client: event.client,
      project: event.project,
      script: event.script,
      author: event.author,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getLibraryEventById(
  id: string,
): Promise<LibraryEvent | undefined> {
  const db = await getDb();
  const event = await db.get(LIBRARY_STORE, id);
  if (!event) return undefined;
  return {
    ...normalizeEvent(event),
    signature: event.signature,
    client: event.client,
    project: event.project,
    script: event.script,
    author: event.author,
  };
}

export async function upsertLibraryEventFromGuide(
  event: MeasurementEvent,
  guide: MeasurementGuide,
): Promise<LibraryEvent> {
  const db = await getDb();
  const signature = buildPayloadSignature(event);
  const existing = await db.getFromIndex(LIBRARY_STORE, 'by-signature', signature);
  const next = toLibraryEvent(event, guide, existing);
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
    client: event.client,
    project: event.project,
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
      technical: {
        triggerCondition: existing.technical.triggerCondition,
        triggerElement: existing.technical.triggerElement,
        triggerElementOther: existing.technical.triggerElementOther,
        developmentNotes: existing.technical.developmentNotes,
        requiredVariables: existing.technical.requiredVariables.map((variable) => ({
          ...variable,
          id: createId(),
        })),
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    signature: '',
    client: existing.client,
    project: existing.project,
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
  const client = filters.client.trim().toLowerCase();
  const project = filters.project.trim().toLowerCase();

  return events.filter((event) => {
    if (client && event.client.toLowerCase() !== client) return false;
    if (project && event.project.toLowerCase() !== project) return false;
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
      event.client,
      event.project,
      event.howItTriggers,
      ...event.customParams.map((param) => `${param.key} ${param.value}`),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}
