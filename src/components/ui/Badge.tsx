import { STRUCTURE_TYPE_LABELS } from '@/constants';
import type { EventStructureType, Priority } from '@/types';

const priorityStyles: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-50 text-amber-800',
  high: 'bg-orange-50 text-orange-800',
  critical: 'bg-red-50 text-red-700',
};

const structureStyles: Record<EventStructureType, string> = {
  ua: 'bg-teal-50 text-teal-800',
  ni: 'bg-sky-50 text-sky-800',
  custom: 'bg-violet-50 text-violet-800',
};

export function StructureBadge({ type }: { type: EventStructureType }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${structureStyles[type]}`}
    >
      {STRUCTURE_TYPE_LABELS[type]}
    </span>
  );
}

export function PriorityBadge({ priority, label }: { priority: Priority; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyles[priority]}`}
    >
      {label}
    </span>
  );
}
