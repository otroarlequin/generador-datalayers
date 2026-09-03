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

/** Countries commonly used in LatAm analytics projects */
export const COUNTRY_OPTIONS = [
  { code: 'AR', labelKey: 'country.AR' },
  { code: 'BO', labelKey: 'country.BO' },
  { code: 'BR', labelKey: 'country.BR' },
  { code: 'CL', labelKey: 'country.CL' },
  { code: 'CO', labelKey: 'country.CO' },
  { code: 'CR', labelKey: 'country.CR' },
  { code: 'EC', labelKey: 'country.EC' },
  { code: 'SV', labelKey: 'country.SV' },
  { code: 'GT', labelKey: 'country.GT' },
  { code: 'HN', labelKey: 'country.HN' },
  { code: 'MX', labelKey: 'country.MX' },
  { code: 'NI', labelKey: 'country.NI' },
  { code: 'PA', labelKey: 'country.PA' },
  { code: 'PY', labelKey: 'country.PY' },
  { code: 'PE', labelKey: 'country.PE' },
  { code: 'DO', labelKey: 'country.DO' },
  { code: 'UY', labelKey: 'country.UY' },
  { code: 'VE', labelKey: 'country.VE' },
  { code: 'US', labelKey: 'country.US' },
  { code: 'ES', labelKey: 'country.ES' },
  { code: 'OTHER', labelKey: 'country.OTHER' },
] as const;

export const SETTINGS_STORAGE_KEY = 'mg_settings';
export const CURRENT_GUIDE_KEY = 'mg_current_guide_id';
export const DB_NAME = 'measurement-guide-db';
export const DB_VERSION = 3;
export const LIBRARY_STORE = 'library_events';
export const GUIDES_STORE = 'guides';
