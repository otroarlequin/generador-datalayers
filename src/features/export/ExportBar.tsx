import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/context/SettingsContext';
import {
  exportGuide,
  type ExportFormat,
} from '@/services/export/exportService';
import type { MeasurementGuide } from '@/types';
import { resolveValidationMessage } from '@/i18n';

type ExportBarProps = {
  guide: MeasurementGuide;
  onExported?: (savedCount: number) => void;
};

export function ExportBar({ guide, onExported }: ExportBarProps) {
  const { t, locale } = useSettings();
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const labels = useMemo(
    () => ({
      client: t('preview.client'),
      project: t('preview.project'),
      generated: t('preview.generated'),
      index: t('preview.index'),
      name: t('preview.name'),
      type: t('preview.type'),
      tested: t('preview.tested'),
      qa: t('preview.qa'),
      general: t('preview.general'),
      interaction: t('preview.interaction'),
      description: t('preview.description'),
      objective: t('preview.objective'),
      screenshot: t('preview.screenshot'),
      how: t('preview.how'),
      data: t('preview.data'),
      script: t('preview.script'),
      technical: t('preview.technical'),
      triggerCondition: t('event.triggerCondition'),
      triggerElement: t('event.triggerElement'),
      devNotes: t('preview.devNotes'),
      variable: t('event.variable'),
      variableDescription: t('event.variableDescription'),
      example: t('event.example'),
      requiredVar: t('event.requiredVar'),
      yes: t('event.yes'),
      no: t('event.no'),
    }),
    [t],
  );

  async function handleExport(format: ExportFormat) {
    setBusy(format);
    setMessage(null);
    setErrors([]);
    try {
      const result = await exportGuide(guide, format, {
        labels,
        locale,
        translate: t,
      });
      if (!result.ok) {
        setErrors(result.errors.map((error) => resolveValidationMessage(locale, error)));
        return;
      }
      setMessage(
        t('export.success', {
          format: format.toUpperCase(),
          count: result.savedCount,
        }),
      );
      onExported?.(result.savedCount);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : t('export.error')]);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          disabled={busy !== null}
          onClick={() => void handleExport('html')}
        >
          {busy === 'html' ? t('export.exporting') : t('export.html')}
        </Button>
        <Button disabled={busy !== null} onClick={() => void handleExport('markdown')}>
          {busy === 'markdown' ? t('export.exporting') : t('export.markdown')}
        </Button>
        <Button disabled={busy !== null} onClick={() => void handleExport('pdf')}>
          {busy === 'pdf' ? t('export.exporting') : t('export.pdf')}
        </Button>
      </div>
      {message ? (
        <p className="rounded-md border border-teal-200 bg-accent-soft px-3 py-2 text-sm text-teal-900 dark:border-teal-900 dark:text-teal-100">
          {message}
        </p>
      ) : null}
      {errors.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-900 dark:bg-red-950/40">
          <p className="font-medium">{t('export.cannot')}</p>
          <ul className="mt-1 list-disc pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
