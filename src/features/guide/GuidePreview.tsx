import type { ReactNode } from 'react';
import { PriorityBadge, StructureBadge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { useSettings } from '@/context/SettingsContext';
import { buildGuideDocument } from '@/generators/documentModel';
import type { MeasurementGuide } from '@/types';
import { formatDate } from '@/utils/helpers';

type GuidePreviewProps = {
  guide: MeasurementGuide;
};

function countryLabel(
  code: string,
  t: (key: string) => string,
): string {
  if (!code || code === '—') return '—';
  const key = `country.${code}`;
  const translated = t(key);
  return translated === key ? code : translated;
}

export function GuidePreview({ guide }: GuidePreviewProps) {
  const { t } = useSettings();
  const document = buildGuideDocument(guide);

  if (document.events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink">{t('preview.empty')}</p>
        <p className="mt-2 text-sm text-ink-muted">{t('preview.emptyHint')}</p>
      </div>
    );
  }

  return (
    <article className="space-y-8 rounded-xl border border-border bg-surface-raised p-6 shadow-sm md:p-8">
      <header className="border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {t('preview.documentLabel')}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {document.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span>{t('preview.brand')}: {document.brand}</span>
          <span>{t('preview.country')}: {countryLabel(document.country, t)}</span>
          <span>{t('preview.generated')}: {formatDate(document.generatedAt)}</span>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-ink">{t('preview.index')}</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-subtle">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t('preview.name')}</th>
                <th className="px-3 py-2">{t('preview.type')}</th>
                <th className="px-3 py-2">event</th>
                <th className="px-3 py-2">event_name</th>
              </tr>
            </thead>
            <tbody>
              {document.index.map((item, index) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">
                    <a href={`#event-${item.id}`} className="text-accent hover:underline">
                      {item.name}
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <StructureBadge type={item.structureType} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{item.event}</td>
                  <td className="px-3 py-2 font-mono text-xs">{item.event_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {document.events.map((event, index) => (
        <section
          key={event.id}
          id={`event-${event.id}`}
          className="scroll-mt-24 space-y-5 border-t border-border pt-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-ink">
              {index + 1}. {event.name}
            </h2>
            <StructureBadge type={event.structureType} />
            <PriorityBadge priority={event.priority} label={event.priorityLabel} />
          </div>

          <PreviewBlock title={t('preview.general')}>
            <MetaRow label={t('preview.interaction')} value={event.interactionType} />
            <MetaRow label={t('preview.brand')} value={event.brand} />
            <MetaRow label={t('preview.country')} value={countryLabel(event.country, t)} />
            <MetaRow label={t('preview.description')} value={event.description || '—'} />
            <MetaRow label={t('preview.objective')} value={event.businessObjective || '—'} />
          </PreviewBlock>

          {event.screenshotDataUrl ? (
            <PreviewBlock title={t('preview.screenshot')}>
              <img
                src={event.screenshotDataUrl}
                alt={`Screenshot of ${event.name}`}
                className="max-h-72 rounded-lg border border-border object-contain"
              />
            </PreviewBlock>
          ) : null}

          <PreviewBlock title={t('preview.how')}>
            <p className="text-sm leading-relaxed text-ink">
              {event.howItTriggers || '—'}
            </p>
          </PreviewBlock>

          <PreviewBlock title={t('preview.data')}>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <tbody>
                  {[
                    ['event', event.event],
                    ['event_name', event.event_name],
                    ['eventCategory', event.eventCategory],
                    ['eventAction', event.eventAction],
                    ['eventLabel', event.eventLabel],
                    ...event.customParams.map(
                      (param) => [param.key, param.value] as const,
                    ),
                  ].map(([key, value]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <th className="w-40 bg-surface px-3 py-2 font-mono text-xs font-medium text-ink-muted">
                        {key}
                      </th>
                      <td className="px-3 py-2 font-mono text-xs text-ink">{value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewBlock>

          <PreviewBlock title={t('preview.script')}>
            <CodeBlock code={event.script} />
          </PreviewBlock>

          {event.requiredVariables.length > 0 ? (
            <PreviewBlock title={t('preview.dictionary')}>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wide text-ink-subtle">
                    <tr>
                      <th className="px-3 py-2">{t('event.variable')}</th>
                      <th className="px-3 py-2">{t('event.variableDescription')}</th>
                      <th className="px-3 py-2">{t('event.example')}</th>
                      <th className="px-3 py-2">{t('event.requiredVar')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.requiredVariables.map((variable) => (
                      <tr key={variable.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-xs">{variable.name}</td>
                        <td className="px-3 py-2">{variable.description}</td>
                        <td className="px-3 py-2 font-mono text-xs">{variable.example}</td>
                        <td className="px-3 py-2">
                          {variable.required ? t('preview.required') : t('preview.optional')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PreviewBlock>
          ) : null}
        </section>
      ))}
    </article>
  );
}

function PreviewBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-ink">
      <span className="font-medium text-ink-muted">{label}: </span>
      {value}
    </p>
  );
}
