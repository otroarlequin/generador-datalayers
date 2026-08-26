import { CURRENT_GUIDE_KEY, GUIDES_STORE } from '@/constants';
import { getDb } from '@/services/storage/db';
import type { MeasurementGuide } from '@/types';
import { createEmptyGuide, normalizeGuide, nowIso } from '@/utils/factory';

export async function listGuides(): Promise<MeasurementGuide[]> {
  const db = await getDb();
  const guides = await db.getAll(GUIDES_STORE);
  return guides
    .map((guide) => normalizeGuide(guide))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getGuideById(id: string): Promise<MeasurementGuide | undefined> {
  const db = await getDb();
  const guide = await db.get(GUIDES_STORE, id);
  return guide ? normalizeGuide(guide) : undefined;
}

export async function saveGuide(guide: MeasurementGuide): Promise<MeasurementGuide> {
  const db = await getDb();
  const next = normalizeGuide({
    ...guide,
    updatedAt: nowIso(),
  });
  await db.put(GUIDES_STORE, next);
  localStorage.setItem(CURRENT_GUIDE_KEY, next.id);
  return next;
}

export async function createGuide(
  partial?: Partial<MeasurementGuide>,
): Promise<MeasurementGuide> {
  const guide = createEmptyGuide(partial);
  return saveGuide(guide);
}

export async function deleteGuide(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(GUIDES_STORE, id);
  if (localStorage.getItem(CURRENT_GUIDE_KEY) === id) {
    localStorage.removeItem(CURRENT_GUIDE_KEY);
  }
}

export async function migrateLegacyGuideIfNeeded(): Promise<void> {
  const legacyKey = 'mg_current_guide';
  const raw = localStorage.getItem(legacyKey);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as MeasurementGuide;
    if (parsed?.id && Array.isArray(parsed.events)) {
      const existing = await getGuideById(parsed.id);
      if (!existing) {
        await saveGuide(normalizeGuide(parsed));
      }
    }
  } catch {
    // ignore invalid legacy payload
  } finally {
    localStorage.removeItem(legacyKey);
  }
}
