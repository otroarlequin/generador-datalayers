import { buildGuideDocument } from '@/generators/documentGenerator';
import type { ExportOptions } from '@/services/export/exportService';
import type { MeasurementGuide } from '@/types';
import { downloadBlob, slugify } from '@/utils/helpers';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildGuideHtml(
  guide: MeasurementGuide,
  labels: Record<string, string>,
): string {
  const document = buildGuideDocument(guide);

  const eventSections = document.events
    .map((event, index) => {
      const screenshot = event.screenshotDataUrl
        ? `<img src="${event.screenshotDataUrl}" alt="Screenshot" style="max-height:280px;border:1px solid #e4e4e0;border-radius:8px;" />`
        : '';

      const dataRows = [
        ['event', event.event],
        ['event_name', event.event_name],
        ['eventCategory', event.eventCategory],
        ['eventAction', event.eventAction],
        ['eventLabel', event.eventLabel],
        ...event.customParams.map((param) => [param.key, param.value] as const),
      ]
        .map(
          ([key, value]) =>
            `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value || '—')}</td></tr>`,
        )
        .join('');

      const variables =
        event.requiredVariables.length > 0
          ? `<h3>${labels.dictionary}</h3><table><thead><tr><th>${labels.variable}</th><th>${labels.variableDescription}</th><th>${labels.example}</th><th>${labels.requiredVar}</th></tr></thead><tbody>${event.requiredVariables
              .map(
                (variable) =>
                  `<tr><td>${escapeHtml(variable.name)}</td><td>${escapeHtml(variable.description)}</td><td>${escapeHtml(variable.example)}</td><td>${variable.required ? labels.yes : labels.no}</td></tr>`,
              )
              .join('')}</tbody></table>`
          : '';

      return `
        <section id="event-${event.id}" class="event">
          <h2>${index + 1}. ${escapeHtml(event.name)}</h2>
          <h3>${labels.general}</h3>
          <p><strong>${labels.interaction}:</strong> ${escapeHtml(event.interactionType)}</p>
          <p><strong>${labels.description}:</strong> ${escapeHtml(event.description || '—')}</p>
          <p><strong>${labels.objective}:</strong> ${escapeHtml(event.businessObjective || '—')}</p>
          ${screenshot ? `<h3>${labels.screenshot}</h3>${screenshot}` : ''}
          <h3>${labels.how}</h3>
          <p>${escapeHtml(event.howItTriggers || '—')}</p>
          <h3>${labels.data}</h3>
          <table>${dataRows}</table>
          <h3>${labels.script}</h3>
          <pre><code>${escapeHtml(event.script)}</code></pre>
          ${variables}
        </section>
      `;
    })
    .join('');

  const indexRows = document.index
    .map(
      (item, index) =>
        `<tr><td>${index + 1}</td><td><a href="#event-${item.id}">${escapeHtml(item.name)}</a></td><td>${escapeHtml(item.structureType)}</td><td>${escapeHtml(item.event)}</td><td>${escapeHtml(item.event_name)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(document.title)}</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; color: #171717; max-width: 960px; margin: 0 auto; padding: 40px 24px; line-height: 1.5; }
    h1, h2, h3 { color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 14px; }
    th, td { border: 1px solid #e4e4e0; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f7f7f5; }
    pre { background: #111113; color: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    .meta { color: #5c5c5c; font-size: 14px; }
    .event { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e0; }
    @media print { body { padding: 0; } a { color: inherit; text-decoration: none; } }
  </style>
</head>
<body>
  <header>
    <p class="meta">Measurement Guide</p>
    <h1>${escapeHtml(document.title)}</h1>
    <p class="meta"><strong>${labels.brand}:</strong> ${escapeHtml(document.brand)} · <strong>${labels.country}:</strong> ${escapeHtml(document.country)} · <strong>${labels.generated}:</strong> ${escapeHtml(document.generatedAt)}</p>
  </header>
  <section>
    <h2>${labels.index}</h2>
    <table>
      <thead><tr><th>#</th><th>${labels.name}</th><th>${labels.type}</th><th>event</th><th>event_name</th></tr></thead>
      <tbody>${indexRows}</tbody>
    </table>
  </section>
  ${eventSections}
</body>
</html>`;
}

export function exportGuideToHtml(
  guide: MeasurementGuide,
  labels: Record<string, string>,
  _options?: ExportOptions,
): void {
  const document = buildGuideDocument(guide);
  const html = buildGuideHtml(guide, labels);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${slugify(document.title)}.html`);
}
