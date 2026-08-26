import { TextField } from '@/components/ui/Field';
import { useT } from '@/context/SettingsContext';
import type { MeasurementGuide } from '@/types';

type GuideHeaderProps = {
  guide: MeasurementGuide;
  onChange: (patch: Partial<MeasurementGuide>) => void;
};

export function GuideHeader({ guide, onChange }: GuideHeaderProps) {
  const t = useT();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TextField
        label={t('guide.header.title')}
        required
        value={guide.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder={t('guide.header.titlePlaceholder')}
        className="md:col-span-3"
      />
      <TextField
        label={t('guide.header.client')}
        value={guide.client}
        onChange={(event) => onChange({ client: event.target.value })}
        placeholder={t('guide.header.clientPlaceholder')}
        hint={t('guide.header.clientHint')}
      />
      <TextField
        label={t('guide.header.project')}
        value={guide.project}
        onChange={(event) => onChange({ project: event.target.value })}
        placeholder={t('guide.header.projectPlaceholder')}
        hint={t('guide.header.projectHint')}
      />
    </div>
  );
}
