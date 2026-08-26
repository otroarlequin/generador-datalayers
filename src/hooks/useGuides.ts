import { useCallback, useEffect, useState } from 'react';
import { listGuides } from '@/services/guideService';
import type { MeasurementGuide } from '@/types';

export function useGuides() {
  const [guides, setGuides] = useState<MeasurementGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await listGuides();
      setGuides(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading guides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { guides, loading, error, refresh };
}
