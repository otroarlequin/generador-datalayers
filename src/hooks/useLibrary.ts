import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteLibraryEvent,
  duplicateLibraryEvent,
  filterLibraryEvents,
  listLibraryEvents,
  saveLibraryEvent,
} from '@/services/library/libraryService';
import type { LibraryEvent, LibraryFilters } from '@/types';

const emptyFilters: LibraryFilters = {
  query: '',
  brand: '',
  country: '',
  structureType: '',
};

export function useLibrary() {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [filters, setFilters] = useState<LibraryFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listLibraryEvents();
      setEvents(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'library.loading');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredEvents = useMemo(
    () => filterLibraryEvents(events, filters),
    [events, filters],
  );

  const brands = useMemo(
    () => [...new Set(events.map((event) => event.brand).filter(Boolean))].sort(),
    [events],
  );

  const countries = useMemo(
    () => [...new Set(events.map((event) => event.country).filter(Boolean))].sort(),
    [events],
  );

  const remove = useCallback(async (id: string) => {
    await deleteLibraryEvent(id);
    await refresh();
  }, [refresh]);

  const duplicate = useCallback(async (id: string) => {
    await duplicateLibraryEvent(id);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (event: LibraryEvent) => {
    const saved = await saveLibraryEvent(event);
    await refresh();
    return saved;
  }, [refresh]);

  return {
    events,
    filteredEvents,
    filters,
    setFilters,
    loading,
    error,
    brands,
    countries,
    refresh,
    remove,
    duplicate,
    update,
  };
}
