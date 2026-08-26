import { v4 as uuidv4 } from 'uuid';
import { createDefaultQaChecklist } from '@/constants';
import type {
  CustomParam,
  DataLayerVariable,
  MeasurementEvent,
  MeasurementGuide,
  QaItem,
  TechnicalSpec,
} from '@/types';

export function createId(): string {
  return uuidv4();
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

export function createTechnicalSpec(
  partial?: Partial<TechnicalSpec>,
): TechnicalSpec {
  return {
    triggerCondition: '',
    triggerElement: '',
    triggerElementOther: '',
    requiredVariables: [],
    developmentNotes: '',
    ...partial,
  };
}

export function normalizeEvent(raw: Partial<MeasurementEvent> & { id?: string }): MeasurementEvent {
  const timestamp = nowIso();
  const technical = raw.technical ?? createTechnicalSpec();
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
    technical: {
      triggerCondition: technical.triggerCondition ?? '',
      triggerElement: technical.triggerElement ?? '',
      triggerElementOther: technical.triggerElementOther ?? '',
      requiredVariables: technical.requiredVariables ?? [],
      developmentNotes: technical.developmentNotes ?? '',
    },
    createdAt: raw.createdAt ?? timestamp,
    updatedAt: raw.updatedAt ?? timestamp,
  };
}

export function createEmptyEvent(
  partial?: Partial<MeasurementEvent>,
): MeasurementEvent {
  return normalizeEvent({
    ...partial,
    technical: createTechnicalSpec(partial?.technical),
  });
}

export function createEmptyGuide(
  partial?: Partial<MeasurementGuide>,
): MeasurementGuide {
  const timestamp = nowIso();
  return {
    id: createId(),
    title: 'New Measurement Guide',
    client: '',
    project: '',
    qaChecklist: createDefaultQaChecklist(),
    events: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...partial,
  };
}

export function normalizeQaChecklist(items?: QaItem[]): QaItem[] {
  if (!items || items.length === 0) return createDefaultQaChecklist();
  return items.map((item) => ({
    id: item.id ?? createId(),
    label: item.label ?? '',
  }));
}

export function normalizeGuide(raw: Partial<MeasurementGuide> & { id?: string }): MeasurementGuide {
  const timestamp = nowIso();
  return {
    ...createEmptyGuide(),
    ...raw,
    id: raw.id ?? createId(),
    qaChecklist: normalizeQaChecklist(raw.qaChecklist),
    events: (raw.events ?? []).map((event) => normalizeEvent(event)),
    createdAt: raw.createdAt ?? timestamp,
    updatedAt: raw.updatedAt ?? timestamp,
  };
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
    technical: {
      triggerCondition: event.technical.triggerCondition,
      triggerElement: event.technical.triggerElement,
      triggerElementOther: event.technical.triggerElementOther,
      developmentNotes: event.technical.developmentNotes,
      requiredVariables: event.technical.requiredVariables.map((variable) => ({
        ...variable,
        id: createId(),
      })),
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}
