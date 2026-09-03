import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useT } from '@/context/SettingsContext';
import { EventForm } from '@/features/events/EventForm';
import { ExportBar } from '@/features/export/ExportBar';
import { EventList } from '@/features/guide/EventList';
import { GuideHeader } from '@/features/guide/GuideHeader';
import { GuidePreview } from '@/features/guide/GuidePreview';
import { useGuide } from '@/hooks/useGuide';
import type { MeasurementEvent } from '@/types';

type GuideLocationState = {
  templateEvent?: MeasurementEvent;
};

export function GuideEditorPage() {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const processedTemplateKey = useRef<string | null>(null);
  const {
    guide,
    loading,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    updateGuide,
    addEvent,
    updateEvent,
    removeEvent,
    moveEvent,
    addEventFromTemplate,
  } = useGuide();
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const state = location.state as GuideLocationState | null;
    const template = state?.templateEvent;
    if (!template || !guide) return;

    const key = `${template.id}:${template.updatedAt}`;
    if (processedTemplateKey.current === key) return;
    processedTemplateKey.current = key;

    addEventFromTemplate(template);
    navigate('.', { replace: true, state: null });
  }, [location.state, addEventFromTemplate, navigate, guide]);

  if (loading || !guide) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-sm text-ink-muted">{t('guide.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface-raised px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t('guide.title')}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t('guide.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/guias')}>
              {t('guide.backToList')}
            </Button>
            <Button variant="ghost" onClick={() => setShowPreview((value) => !value)}>
              {showPreview ? t('guide.hidePreview') : t('guide.showPreview')}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <ExportBar guide={guide} />
        </div>
      </header>

      <div
        className={`flex flex-1 flex-col ${
          showPreview
            ? 'xl:grid xl:grid-cols-[280px_minmax(0,1fr)_minmax(320px,42%)]'
            : 'lg:grid lg:grid-cols-[280px_minmax(0,1fr)]'
        }`}
      >
        <div className="flex max-h-[50vh] flex-col overflow-hidden border-b border-border bg-surface-raised xl:max-h-none xl:border-b-0 xl:border-r">
          <div id="guide-start" className="shrink-0 border-b border-border p-3">
            <GuideHeader
              key={
                guide.events.length > 0 && Boolean(guide.brand.trim() && guide.country.trim())
                  ? 'guide-collapsed'
                  : 'guide-open'
              }
              guide={guide}
              onChange={updateGuide}
              collapsed={
                guide.events.length > 0 &&
                Boolean(guide.brand.trim() && guide.country.trim())
              }
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <EventList
              events={guide.events}
              selectedEventId={selectedEventId}
              onSelect={setSelectedEventId}
              onAdd={() => addEvent()}
              onRemove={removeEvent}
              onMove={moveEvent}
            />
          </div>
        </div>

        <div className="overflow-y-auto border-b border-border p-6 xl:border-b-0 xl:border-r">
          <div className="mx-auto max-w-4xl space-y-6">
            {selectedEvent ? (
              <EventForm
                event={selectedEvent}
                guide={guide}
                onChange={(patch) => updateEvent(selectedEvent.id, patch)}
                onBackToStart={() => {
                  setSelectedEventId(null);
                  document.getElementById('guide-start')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
                <p className="text-base font-semibold text-ink">{t('guide.emptySelect')}</p>
                <p className="mt-2 text-sm text-ink-muted">{t('guide.emptySelectHint')}</p>
                <Button className="mt-4" variant="primary" onClick={() => addEvent()}>
                  {t('guide.addEvent')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {showPreview ? (
          <div className="flex flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-surface-raised px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                {t('preview.panelBadge')}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">
                {t('preview.panelTitle')}
              </h3>
              <p className="mt-1 text-xs text-ink-muted">{t('preview.panelHint')}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <GuidePreview guide={guide} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
