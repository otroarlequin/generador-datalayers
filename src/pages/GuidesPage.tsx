import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useT } from '@/context/SettingsContext';
import { useGuides } from '@/hooks/useGuides';
import { exportGuidesBackup, importGuidesBackup } from '@/services/backupService';
import { createGuide, deleteGuide } from '@/services/guideService';
import { formatDate } from '@/utils/helpers';

export function GuidesPage() {
  const t = useT();
  const navigate = useNavigate();
  const { guides, loading, error, refresh } = useGuides();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    setBusy(true);
    try {
      const guide = await createGuide();
      navigate(`/guia/${guide.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('guides.confirmDelete'))) return;
    await deleteGuide(id);
    await refresh();
  }

  async function handleExportBackup() {
    setBusy(true);
    setStatus(null);
    try {
      await exportGuidesBackup();
      setStatus(t('guides.backupExported'));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t('guides.backupError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleImportBackup(file: File | null) {
    if (!file) return;
    setBusy(true);
    setStatus(null);
    try {
      const count = await importGuidesBackup(file);
      await refresh();
      setStatus(t('guides.backupImported', { count }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t('guides.backupError'));
    } finally {
      setBusy(false);
      if (importRef.current) importRef.current.value = '';
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface-raised px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t('guides.title')}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t('guides.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" disabled={busy} onClick={() => void handleCreate()}>
              {t('guides.create')}
            </Button>
            <Button disabled={busy} onClick={() => void handleExportBackup()}>
              {t('guides.exportBackup')}
            </Button>
            <Button disabled={busy} onClick={() => importRef.current?.click()}>
              {t('guides.importBackup')}
            </Button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => void handleImportBackup(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        {status ? (
          <p className="mt-3 rounded-md border border-teal-200 bg-accent-soft px-3 py-2 text-sm text-teal-900 dark:border-teal-900 dark:text-teal-100">
            {status}
          </p>
        ) : null}
      </header>

      <div className="flex-1 p-6">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger dark:border-red-900 dark:bg-red-950/40">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-ink-muted">{t('guides.loading')}</p>
        ) : guides.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
            <p className="text-base font-semibold text-ink">{t('guides.empty')}</p>
            <p className="mt-2 text-sm text-ink-muted">{t('guides.emptyHint')}</p>
            <Button className="mt-4" variant="primary" onClick={() => void handleCreate()}>
              {t('guides.create')}
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface-raised">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-ink-subtle">
                <tr>
                  <th className="px-4 py-3">{t('guides.col.title')}</th>
                  <th className="px-4 py-3">{t('guides.col.client')}</th>
                  <th className="px-4 py-3">{t('guides.col.project')}</th>
                  <th className="px-4 py-3">{t('guides.col.events')}</th>
                  <th className="px-4 py-3">{t('guides.col.updated')}</th>
                  <th className="px-4 py-3">{t('guides.col.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="font-medium text-accent hover:underline"
                        onClick={() => navigate(`/guia/${guide.id}`)}
                      >
                        {guide.title || t('guides.untitled')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{guide.client || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{guide.project || '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{guide.events.length}</td>
                    <td className="px-4 py-3 text-ink-subtle">{formatDate(guide.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button onClick={() => navigate(`/guia/${guide.id}`)}>
                          {t('guides.open')}
                        </Button>
                        <Button variant="danger" onClick={() => void handleDelete(guide.id)}>
                          {t('guides.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
