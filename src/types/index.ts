export type EventStructureType = 'ua' | 'ni' | 'custom';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type CustomParam = {
  id: string;
  key: string;
  value: string;
};

export type DataLayerVariable = {
  id: string;
  name: string;
  description: string;
  example: string;
  required: boolean;
};

export type MeasurementEvent = {
  id: string;
  name: string;
  description: string;
  businessObjective?: string;
  priority: Priority;
  interactionType: string;
  structureType: EventStructureType;
  event: string;
  event_name: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  customParams: CustomParam[];
  screenshotDataUrl?: string;
  howItTriggers: string;
  requiredVariables: DataLayerVariable[];
  createdAt: string;
  updatedAt: string;
};

export type MeasurementGuide = {
  id: string;
  title: string;
  brand: string;
  country: string;
  events: MeasurementEvent[];
  createdAt: string;
  updatedAt: string;
};

export type LibraryEvent = MeasurementEvent & {
  signature: string;
  brand: string;
  country: string;
  script: string;
  author?: string;
};

export type LibraryFilters = {
  query: string;
  brand: string;
  country: string;
  structureType: EventStructureType | '';
};

export type DocumentIndexItem = {
  id: string;
  name: string;
  structureType: EventStructureType;
  event: string;
  event_name: string;
};

export type DocumentEventBlock = {
  id: string;
  name: string;
  structureType: EventStructureType;
  structureLabel: string;
  priority: Priority;
  priorityLabel: string;
  interactionType: string;
  description: string;
  businessObjective: string;
  brand: string;
  country: string;
  screenshotDataUrl?: string;
  howItTriggers: string;
  event: string;
  event_name: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  customParams: CustomParam[];
  script: string;
  requiredVariables: DataLayerVariable[];
};

export type GuideDocument = {
  title: string;
  brand: string;
  country: string;
  generatedAt: string;
  index: DocumentIndexItem[];
  events: DocumentEventBlock[];
};
