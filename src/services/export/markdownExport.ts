import { buildGuideDocument, buildGuideMarkdown } from '@/generators/documentGenerator';
import type { ExportOptions } from '@/services/export/exportService';
import type { MeasurementGuide } from '@/types';
import { downloadBlob, slugify } from '@/utils/helpers';

export function exportGuideToMarkdown(
  guide: MeasurementGuide,
  labels: Record<string, string>,
  options: ExportOptions,
): void {
  const document = buildGuideDocument(guide, {
    locale: options.locale,
    translate: options.translate,
  });
  const markdown = buildGuideMarkdown(document, labels);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${slugify(document.title)}.md`);
}
