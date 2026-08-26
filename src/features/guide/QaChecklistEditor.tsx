import { createDefaultQaChecklist } from '@/constants';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { SectionCard } from '@/components/ui/SectionCard';
import { useT } from '@/context/SettingsContext';
import type { MeasurementGuide, QaItem } from '@/types';
import { createId } from '@/utils/factory';

type QaChecklistEditorProps = {
  guide: MeasurementGuide;
  onChange: (items: QaItem[]) => void;
};

export function QaChecklistEditor({ guide, onChange }: QaChecklistEditorProps) {
  const t = useT();

  function displayLabel(item: QaItem): string {
    return item.label.startsWith('qa.') ? t(item.label) : item.label;
  }

  function updateItem(id: string, label: string) {
    onChange(
      guide.qaChecklist.map((item) => (item.id === id ? { ...item, label } : item)),
    );
  }

  function removeItem(id: string) {
    onChange(guide.qaChecklist.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([...guide.qaChecklist, { id: createId(), label: '' }]);
  }

  return (
    <SectionCard
      title={t('qa.title')}
      description={t('qa.description')}
      action={<Button onClick={addItem}>{t('qa.add')}</Button>}
    >
      <div className="space-y-2">
        {guide.qaChecklist.map((item) => (
          <div key={item.id} className="flex items-end gap-2">
            <TextField
              label={t('qa.itemLabel')}
              value={displayLabel(item)}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1"
            />
            <Button variant="danger" onClick={() => removeItem(item.id)}>
              {t('qa.remove')}
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-subtle">{t('qa.hint')}</p>
      <Button className="mt-3" variant="ghost" onClick={() => onChange(createDefaultQaChecklist())}>
        {t('qa.reset')}
      </Button>
    </SectionCard>
  );
}
