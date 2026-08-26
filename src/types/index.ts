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

export type TriggerElement =
  | 'button'
  | 'link'
  | 'banner'
  | 'form'
  | 'popup'
  | 'menu'
  | 'checkout'
  | 'other';

export type TechnicalSpec = {
  triggerCondition: string;
  triggerElement: TriggerElement | '';
  triggerElementOther: string;
  requiredVariables: DataLayerVariable[];
  developmentNotes: string;
  triggerElementLabel?: string;
};

export type QaItem = {
  id: string;
  label: string;
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
  technical: TechnicalSpec;
  createdAt: string;
  updatedAt: string;
};

export type MeasurementGuide = {
  id: string;
  title: string;
  client: string;
  project: string;
  qaChecklist: QaItem[];
  events: MeasurementEvent[];
  createdAt: string;
  updatedAt: string;
};

export type LibraryEvent = MeasurementEvent & {
  signature: string;
  client: string;
  project: string;
  script: string;
  author?: string;
};

export type LibraryFilters = {
  query: string;
  client: string;
  project: string;
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
  client: string;
  project: string;
  screenshotDataUrl?: string;
  howItTriggers: string;
  event: string;
  event_name: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  customParams: CustomParam[];
  script: string;
  technical: TechnicalSpec;
};

export type GuideDocument = {
  title: string;
  client: string;
  project: string;
  generatedAt: string;
  index: DocumentIndexItem[];
  qaChecklist: string[];
  events: DocumentEventBlock[];
};
