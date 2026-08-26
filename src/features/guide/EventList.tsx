import { Button } from '@/components/ui/Button';
import { StructureBadge } from '@/components/ui/Badge';
import { useT } from '@/context/SettingsContext';
import type { MeasurementEvent } from '@/types';

type EventListProps = {
  events: MeasurementEvent[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
};

export function EventList({
  events,
  selectedEventId,
  onSelect,
  onAdd,
  onRemove,
  onMove,
}: EventListProps) {
  const t = useT();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('events.title')}</h2>
          <p className="text-xs text-ink-subtle">
            {t('events.count', { count: events.length })}
          </p>
        </div>
        <Button variant="primary" onClick={onAdd}>
          {t('events.add')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">{t('events.empty')}</p>
            <p className="mt-1 text-xs text-ink-muted">{t('events.emptyHint')}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((event, index) => {
              const selected = event.id === selectedEventId;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(event.id)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      selected
                        ? 'border-accent bg-accent-soft/40'
                        : 'border-border bg-surface-raised hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {index + 1}. {event.name || event.event_name || t('events.untitled')}
                        </p>
                        <p className="mt-1 truncate font-mono text-[11px] text-ink-subtle">
                          {event.event || 'event'} · {event.event_name || 'event_name'}
                        </p>
                      </div>
                      <StructureBadge type={event.structureType} />
                    </div>
                  </button>
                  <div className="mt-1 flex items-center gap-1 px-1">
                    <Button
                      variant="ghost"
                      className="!px-2 !py-1 text-xs"
                      onClick={() => onMove(event.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      className="!px-2 !py-1 text-xs"
                      onClick={() => onMove(event.id, 'down')}
                      disabled={index === events.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      className="!px-2 !py-1 text-xs text-danger"
                      onClick={() => onRemove(event.id)}
                    >
                      {t('events.delete')}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
