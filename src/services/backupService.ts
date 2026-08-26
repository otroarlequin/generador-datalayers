import { listGuides, saveGuide } from '@/services/guideService';
import type { MeasurementGuide } from '@/types';
import { normalizeGuide } from '@/utils/factory';
import { downloadBlob } from '@/utils/helpers';

export type GuidesBackup = {
  version: 1;
  exportedAt: string;
  guides: MeasurementGuide[];
};

export async function exportGuidesBackup(): Promise<void> {
  const guides = await listGuides();
  const payload: GuidesBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    guides,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `datalayers-backup-${stamp}.json`);
}

export async function importGuidesBackup(file: File): Promise<number> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<GuidesBackup>;

  if (!parsed.guides || !Array.isArray(parsed.guides)) {
    throw new Error('Invalid backup file');
  }

  let count = 0;
  for (const raw of parsed.guides) {
    await saveGuide(normalizeGuide(raw));
    count += 1;
  }
  return count;
}
