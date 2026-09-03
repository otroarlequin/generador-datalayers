import type {
  CustomParam,
  DataLayerVariable,
  MeasurementEvent,
  MeasurementGuide,
} from '@/types';

export function createId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function createCustomParam(
  partial?: Partial<CustomParam>,
): CustomParam {
  return {
    id: createId(),
    key: '',
    value: '',
    ...partial,
  };
}

export function createDataLayerVariable(
  partial?: Partial<DataLayerVariable>,
): DataLayerVariable {
  return {
    id: createId(),
    name: '',
    description: '',
    example: '',
    required: false,
    ...partial,
  };
}

type LegacyTechnical = {
  requiredVariables?: DataLayerVariable[];
  triggerCondition?: string;
  triggerElement?: string;
  triggerElementOther?: string;
  developmentNotes?: string;
};

type LegacyEvent = Partial<MeasurementEvent> & {
  id?: string;
  technical?: LegacyTechnical;
};

export function normalizeEvent(raw: LegacyEvent): MeasurementEvent {
  const timestamp = nowIso();
  const requiredVariables =
    raw.requiredVariables ??
    raw.technical?.requiredVariables ??
    [];

  return {
    id: raw.id ?? createId(),
    name: raw.name ?? '',
    description: raw.description ?? '',
    businessObjective: raw.businessObjective ?? '',
    priority: raw.priority ?? 'medium',
    interactionType: raw.interactionType ?? 'Click',
    structureType: raw.structureType ?? 'ua',
    event: raw.event ?? 'uaevent',
    event_name: raw.event_name ?? '',
    eventCategory: raw.eventCategory ?? '',
    eventAction: raw.eventAction ?? '',
    eventLabel: raw.eventLabel ?? '',
    customParams: raw.customParams ?? [],
    screenshotDataUrl: raw.screenshotDataUrl,
    howItTriggers: raw.howItTriggers ?? '',
    requiredVariables,
    createdAt: raw.createdAt ?? timestamp,
    updatedAt: raw.updatedAt ?? timestamp,
  };
}

export function createEmptyEvent(
  partial?: Partial<MeasurementEvent>,
): MeasurementEvent {
  return normalizeEvent({
    ...partial,
  });
}

type LegacyGuide = Partial<MeasurementGuide> & {
  id?: string;
  client?: string;
  project?: string;
  qaChecklist?: unknown;
};

export function normalizeGuide(raw: LegacyGuide): MeasurementGuide {
  const timestamp = nowIso();
  return {
    id: raw.id ?? createId(),
    title: raw.title ?? 'New Measurement Guide',
    brand: raw.brand ?? raw.client ?? '',
    country: raw.country ?? raw.project ?? '',
    events: (raw.events ?? []).map((event) => normalizeEvent(event)),
    createdAt: raw.createdAt ?? timestamp,
    updatedAt: raw.updatedAt ?? timestamp,
  };
}

export function createEmptyGuide(
  partial?: Partial<MeasurementGuide>,
): MeasurementGuide {
  const timestamp = nowIso();
  return normalizeGuide({
    id: createId(),
    title: 'New Measurement Guide',
    brand: '',
    country: '',
    events: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...partial,
  });
}

export function cloneEventAsTemplate(
  event: MeasurementEvent,
): MeasurementEvent {
  const timestamp = nowIso();
  return normalizeEvent({
    ...event,
    id: createId(),
    customParams: event.customParams.map((param) => ({
      ...param,
      id: createId(),
    })),
    requiredVariables: event.requiredVariables.map((variable) => ({
      ...variable,
      id: createId(),
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}
