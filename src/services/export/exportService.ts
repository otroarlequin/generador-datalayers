import { buildGuideDocument } from '@/generators/documentModel';
import {
  saveEventToLibrary,
  upsertGuideEventsToLibrary,
} from '@/services/library/libraryService';
import type { DocumentLocale } from '@/generators/documentGenerator';
import type { MeasurementEvent, MeasurementGuide } from '@/types';
import { validateGuideForExport } from '@/utils/validation';

export type ExportFormat = 'html' | 'markdown' | 'pdf';

export type ExportResult = {
  ok: boolean;
  errors: string[];
  savedCount: number;
};

export type ExportLabels = Record<string, string>;

export type ExportOptions = {
  labels: ExportLabels;
  locale: DocumentLocale;
  translate: (key: string) => string;
};

export async function exportGuide(
  guide: MeasurementGuide,
  format: ExportFormat,
  options: ExportOptions,
): Promise<ExportResult> {
  const errors = validateGuideForExport(guide);
  if (errors.length > 0) {
    return { ok: false, errors, savedCount: 0 };
  }

  const document = buildGuideDocument(guide, {
    locale: options.locale,
    translate: options.translate,
  });

  if (format === 'html') {
    const { exportGuideToHtml } = await import('@/services/export/htmlExport');
    exportGuideToHtml(guide, options.labels, options);
  } else if (format === 'markdown') {
    const { exportGuideToMarkdown } = await import('@/services/export/markdownExport');
    exportGuideToMarkdown(guide, options.labels, options);
  } else {
    const { exportGuideToPdf } = await import('@/services/export/pdfExport');
    await exportGuideToPdf(document);
  }

  const saved = await upsertGuideEventsToLibrary(guide);
  return { ok: true, errors: [], savedCount: saved.length };
}

export async function saveEventToLibraryFromGuide(
  event: MeasurementEvent,
  guide: MeasurementGuide,
): Promise<void> {
  await saveEventToLibrary(event, guide);
}
