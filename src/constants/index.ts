import type { EventStructureType, Priority } from '@/types';

export const STRUCTURE_TYPE_OPTIONS: {
  value: EventStructureType;
  label: string;
  eventValue: string | null;
}[] = [
  { value: 'ua', label: 'UA Event', eventValue: 'uaevent' },
  { value: 'ni', label: 'NI Event', eventValue: 'nievent' },
  { value: 'custom', label: 'Custom', eventValue: null },
];

export const STRUCTURE_TYPE_LABELS: Record<EventStructureType, string> = {
  ua: 'UA Event',
  ni: 'NI Event',
  custom: 'Custom',
};

export const PRIORITY_OPTIONS: { value: Priority; labelKey: string }[] = [
  { value: 'low', labelKey: 'priority.low' },
  { value: 'medium', labelKey: 'priority.medium' },
  { value: 'high', labelKey: 'priority.high' },
  { value: 'critical', labelKey: 'priority.critical' },
];

/** English labels for exported documents */
export const PRIORITY_LABELS_EN: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const INTERACTION_TYPE_OPTIONS = [
  'Click',
  'Submit',
  'View',
  'Scroll',
  'Hover',
  'Change',
  'Load',
  'Custom',
] as const;

import { v4 as uuidv4 } from 'uuid';
import type { QaItem, TriggerElement } from '@/types';

export const TRIGGER_ELEMENT_OPTIONS: {
  value: TriggerElement;
  labelKey: string;
}[] = [
  { value: 'button', labelKey: 'trigger.button' },
  { value: 'link', labelKey: 'trigger.link' },
  { value: 'banner', labelKey: 'trigger.banner' },
  { value: 'form', labelKey: 'trigger.form' },
  { value: 'popup', labelKey: 'trigger.popup' },
  { value: 'menu', labelKey: 'trigger.menu' },
  { value: 'checkout', labelKey: 'trigger.checkout' },
  { value: 'other', labelKey: 'trigger.other' },
];

export const DEFAULT_QA_CHECKLIST_LABELS = [
  'qa.item.firesOnce',
  'qa.item.eventName',
  'qa.item.noUndefined',
  'qa.item.parameters',
  'qa.item.gtmPreview',
  'qa.item.ga4',
  'qa.item.meta',
  'qa.item.consent',
] as const;

export function createDefaultQaChecklist(): QaItem[] {
  return DEFAULT_QA_CHECKLIST_LABELS.map((labelKey) => ({
    id: uuidv4(),
    label: labelKey,
  }));
}

export const SETTINGS_STORAGE_KEY = 'mg_settings';
export const CURRENT_GUIDE_KEY = 'mg_current_guide_id';
export const DB_NAME = 'measurement-guide-db';
export const DB_VERSION = 2;
export const LIBRARY_STORE = 'library_events';
export const GUIDES_STORE = 'guides';
