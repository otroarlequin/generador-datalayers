import { z } from 'zod';
import type { MeasurementGuide } from '@/types';

export const exportGuideSchema = z.object({
  title: z.string().min(1, 'validation.guideTitle'),
  events: z.array(z.unknown()).min(1, 'validation.atLeastOneEvent'),
});

export function validateGuideForExport(guide: MeasurementGuide): string[] {
  const errors: string[] = [];
  const result = exportGuideSchema.safeParse({
    title: guide.title.trim(),
    events: guide.events,
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(issue.message);
    }
  }

  guide.events.forEach((event, index) => {
    const label = event.name.trim() || `Event ${index + 1}`;
    if (!event.name.trim()) {
      errors.push(`validation.eventName:${label}`);
    }
    if (!event.event.trim()) {
      errors.push(`validation.event:${label}`);
    }
    if (!event.event_name.trim()) {
      errors.push(`validation.eventNameField:${label}`);
    }
    if (!event.howItTriggers.trim()) {
      errors.push(`validation.howItTriggers:${label}`);
    }
  });

  return errors;
}
