import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StructureBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { STRUCTURE_TYPE_OPTIONS } from '@/constants';
import { useT } from '@/context/SettingsContext';
import { useLibrary } from '@/hooks/useLibrary';
import { createGuide } from '@/services/guideService';
import type { LibraryEvent } from '@/types';
import { copyToClipboard, formatDate } from '@/utils/helpers';

export function LibraryPage() {
  const t = useT();
  const navigate = useNavigate();
  const {
    filteredEvents,
    filters,
    setFilters,
    loading,
    error,
    brands,
    countries,
    remove,
    duplicate,
    update,
    refresh,
  } = useLibrary();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<LibraryEvent | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const selected = useMemo(
    () => filteredEvents.find((event) => event.id === selectedId) ?? null,
    [filteredEvents, selectedId],
  );

  async function handleCopy(script: string) {
    const ok = await copyToClipboard(script);
    setStatus(ok ? t('library.copied') : t('library.copyFail'));
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('library.confirmDelete'))) return;
    await remove(id);
    if (selectedId === id) setSelectedId(null);
    setStatus(t('library.deleted'));
  }

  async function handleDuplicate(id: string) {
    await duplicate(id);
    setStatus(t('library.duplicated'));
  }

  async function handleUseAsTemplate(event: LibraryEvent) {
    const guide = await createGuide();
    navigate(`/guia/${guide.id}`, { state: { templateEvent: event } });
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const saved = await update(editing);
    setEditing(null);
    setSelectedId(saved.id);
    setStatus(t('library.updatedMsg'));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface-raised px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t('library.title')}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t('library.subtitle')}</p>
          </div>
          <Button onClick={() => void refresh()}>{t('library.refresh')}</Button>
        </div>

        <details className="mt-4 rounded-xl border border-border bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {t('library.filters')}
          </summary>
          <div className="grid gap-3 border-t border-border px-4 py-4 md:grid-cols-2 xl:grid-cols-4">
            <TextField
              label={t('library.search')}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder={t('library.searchPlaceholder')}
            />
            <SelectField
              label={t('library.brand')}
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            >
              <option value="">{t('library.all')}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={t('library.country')}
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            >
              <option value="">{t('library.all')}</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country.startsWith('country.') ? country : (t(`country.${country}`) === `country.${country}` ? country : t(`country.${country}`))}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={t('library.type')}
              value={filters.structureType}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  structureType: e.target.value as typeof filters.structureType,
                })
              }
            >
              <option value="">{t('library.all')}</option>
              {STRUCTURE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        </details>

        {status ? (
          <p className="mt-3 rounded-md border border-teal-200 bg-accent-soft px-3 py-2 text-sm text-teal-900 dark:border-teal-900 dark:text-teal-100">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-900 dark:bg-red-950/40">
            {error}
          </p>
        ) : null}
      </header>

      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-ink-muted">{t('library.loading')}</p>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">{t('library.empty')}</p>
              <p className="mt-2 text-sm text-ink-muted">{t('library.emptyHint')}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-ink-subtle">
                  <tr>
                    <th className="px-4 py-3">{t('library.col.event')}</th>
                    <th className="px-4 py-3">{t('library.col.type')}</th>
                    <th className="px-4 py-3">{t('library.col.brand')}</th>
                    <th className="px-4 py-3">{t('library.col.country')}</th>
                    <th className="px-4 py-3">{t('library.col.updated')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className={`cursor-pointer border-b border-border last:border-0 hover:bg-surface ${
                        selectedId === event.id ? 'bg-accent-soft/30' : ''
                      }`}
                      onClick={() => setSelectedId(event.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {event.name || event.event_name || t('events.untitled')}
                        </p>
                        <p className="font-mono text-[11px] text-ink-subtle">
                          {event.event} · {event.event_name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StructureBadge type={event.structureType} />
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{event.brand}</td>
                      <td className="px-4 py-3 text-ink-muted">{event.country}</td>
                      <td className="px-4 py-3 text-ink-subtle">
                        {formatDate(event.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="border-l border-border bg-surface-raised p-5">
          {!selected ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-ink-muted">
              {t('library.select')}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-ink">
                    {selected.name || selected.event_name}
                  </h3>
                  <StructureBadge type={selected.structureType} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {selected.description || t('library.noDescription')}
                </p>
              </div>

              {selected.screenshotDataUrl ? (
                <img
                  src={selected.screenshotDataUrl}
                  alt={t('event.screenshotAlt')}
                  className="max-h-40 w-full rounded-lg border border-border object-contain"
                />
              ) : null}

              <div className="space-y-1 text-sm">
                <p><span className="text-ink-muted">{t('library.brand')}:</span> {selected.brand}</p>
                <p><span className="text-ink-muted">{t('library.country')}:</span> {selected.country}</p>
                <p><span className="text-ink-muted">{t('library.created')}:</span> {formatDate(selected.createdAt)}</p>
                <p><span className="text-ink-muted">{t('library.updated')}:</span> {formatDate(selected.updatedAt)}</p>
                <p className="font-mono text-xs text-ink-subtle">
                  {t('library.signature')}: {selected.signature}
                </p>
              </div>

              <CodeBlock code={selected.script} />

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => handleUseAsTemplate(selected)}>
                  {t('library.useTemplate')}
                </Button>
                <Button onClick={() => void handleCopy(selected.script)}>
                  {t('library.copyScript')}
                </Button>
                <Button onClick={() => setEditing(selected)}>{t('library.edit')}</Button>
                <Button onClick={() => void handleDuplicate(selected.id)}>
                  {t('library.duplicate')}
                </Button>
                <Button variant="danger" onClick={() => void handleDelete(selected.id)}>
                  {t('library.delete')}
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface-raised p-6 shadow-xl">
            <h3 className="text-lg font-semibold">{t('library.editTitle')}</h3>
            <p className="mt-1 text-sm text-ink-muted">{t('library.editHint')}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TextField
                label={t('event.name')}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <TextField
                label={t('library.brand')}
                value={editing.brand}
                onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
              />
              <TextField
                label={t('library.country')}
                value={editing.country}
                onChange={(e) => setEditing({ ...editing, country: e.target.value })}
              />
              <TextField
                label={t('event.event')}
                value={editing.event}
                onChange={(e) => setEditing({ ...editing, event: e.target.value })}
              />
              <TextField
                label={t('event.eventName')}
                value={editing.event_name}
                onChange={(e) => setEditing({ ...editing, event_name: e.target.value })}
              />
              <TextField
                label={t('event.eventCategory')}
                value={editing.eventCategory}
                onChange={(e) => setEditing({ ...editing, eventCategory: e.target.value })}
              />
              <TextField
                label={t('event.eventAction')}
                value={editing.eventAction}
                onChange={(e) => setEditing({ ...editing, eventAction: e.target.value })}
              />
              <TextField
                label={t('event.eventLabel')}
                value={editing.eventLabel}
                onChange={(e) => setEditing({ ...editing, eventLabel: e.target.value })}
              />
              <TextAreaField
                label={t('event.description')}
                className="md:col-span-2"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
              <TextAreaField
                label={t('event.howItTriggers')}
                className="md:col-span-2"
                value={editing.howItTriggers}
                onChange={(e) => setEditing({ ...editing, howItTriggers: e.target.value })}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setEditing(null)}>{t('library.cancel')}</Button>
              <Button variant="primary" onClick={() => void handleSaveEdit()}>
                {t('library.save')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
