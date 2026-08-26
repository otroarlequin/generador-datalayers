import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createGuide,
  deleteGuide,
  getGuideById,
  migrateLegacyGuideIfNeeded,
  saveGuide,
} from '@/services/guideService';
import type { MeasurementEvent, MeasurementGuide } from '@/types';
import {
  cloneEventAsTemplate,
  createEmptyEvent,
  createEmptyGuide,
  normalizeEvent,
  nowIso,
} from '@/utils/factory';

export function useGuide() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<MeasurementGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      await migrateLegacyGuideIfNeeded();

      if (!guideId) {
        if (active) {
          setGuide(null);
          setLoading(false);
        }
        return;
      }

      const existing = await getGuideById(guideId);
      if (!active) return;

      if (existing) {
        setGuide(existing);
        setSelectedEventId(existing.events[0]?.id ?? null);
      } else {
        const created = await createGuide({ id: guideId });
        if (active) {
          setGuide(created);
          setSelectedEventId(null);
        }
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [guideId]);

  const persistGuide = useCallback((next: MeasurementGuide) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveGuide(next);
    }, 400);
  }, []);

  const updateGuide = useCallback(
    (patch: Partial<MeasurementGuide>) => {
      setGuide((current) => {
        if (!current) return current;
        const next = { ...current, ...patch, updatedAt: nowIso() };
        persistGuide(next);
        return next;
      });
    },
    [persistGuide],
  );

  const addEvent = useCallback(
    (event?: MeasurementEvent) => {
      const next = event ? normalizeEvent(event) : createEmptyEvent();
      setGuide((current) => {
        if (!current) return current;
        const updated = {
          ...current,
          events: [...current.events, next],
          updatedAt: nowIso(),
        };
        persistGuide(updated);
        return updated;
      });
      setSelectedEventId(next.id);
      return next;
    },
    [persistGuide],
  );

  const updateEvent = useCallback(
    (eventId: string, patch: Partial<MeasurementEvent>) => {
      setGuide((current) => {
        if (!current) return current;
        const updated = {
          ...current,
          events: current.events.map((event) =>
            event.id === eventId
              ? normalizeEvent({ ...event, ...patch, updatedAt: nowIso() })
              : event,
          ),
          updatedAt: nowIso(),
        };
        persistGuide(updated);
        return updated;
      });
    },
    [persistGuide],
  );

  const removeEvent = useCallback(
    (eventId: string) => {
      setGuide((current) => {
        if (!current) return current;
        const index = current.events.findIndex((event) => event.id === eventId);
        const events = current.events.filter((event) => event.id !== eventId);
        const fallback = events[Math.max(0, index - 1)] ?? events[0] ?? null;
        setSelectedEventId(fallback?.id ?? null);
        const updated = { ...current, events, updatedAt: nowIso() };
        persistGuide(updated);
        return updated;
      });
    },
    [persistGuide],
  );

  const moveEvent = useCallback(
    (eventId: string, direction: 'up' | 'down') => {
      setGuide((current) => {
        if (!current) return current;
        const index = current.events.findIndex((event) => event.id === eventId);
        if (index < 0) return current;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= current.events.length) return current;
        const events = [...current.events];
        const [item] = events.splice(index, 1);
        events.splice(target, 0, item);
        const updated = { ...current, events, updatedAt: nowIso() };
        persistGuide(updated);
        return updated;
      });
    },
    [persistGuide],
  );

  const addEventFromTemplate = useCallback(
    (template: MeasurementEvent) => addEvent(cloneEventAsTemplate(template)),
    [addEvent],
  );

  const selectedEvent = useMemo(
    () => guide?.events.find((event) => event.id === selectedEventId) ?? null,
    [guide?.events, selectedEventId],
  );

  const createAndOpenGuide = useCallback(async () => {
    const next = createEmptyGuide();
    await saveGuide(next);
    navigate(`/guia/${next.id}`);
    return next;
  }, [navigate]);

  const removeGuide = useCallback(
    async (id: string) => {
      await deleteGuide(id);
      if (guideId === id) {
        navigate('/guias');
      }
    },
    [guideId, navigate],
  );

  return {
    guide,
    loading,
    selectedEventId,
    selectedEvent,
    setSelectedEventId,
    updateGuide,
    addEvent,
    updateEvent,
    removeEvent,
    moveEvent,
    addEventFromTemplate,
    createAndOpenGuide,
    removeGuide,
    setGuide,
  };
}
