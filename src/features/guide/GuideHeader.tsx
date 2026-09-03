import { COUNTRY_OPTIONS } from '@/constants';
import { SelectField, TextField } from '@/components/ui/Field';
import { SectionCard } from '@/components/ui/SectionCard';
import { useT } from '@/context/SettingsContext';
import type { MeasurementGuide } from '@/types';

type GuideHeaderProps = {
  guide: MeasurementGuide;
  onChange: (patch: Partial<MeasurementGuide>) => void;
  /** When true, section starts collapsed (e.g. while editing an event). */
  collapsed?: boolean;
};

export function GuideHeader({ guide, onChange, collapsed = false }: GuideHeaderProps) {
  const t = useT();
  const summary = [guide.brand, guide.country ? t(`country.${guide.country}`) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <SectionCard
      title={t('guide.header.sectionTitle')}
      description={summary || t('guide.header.sectionHint')}
      collapsible
      defaultOpen={!collapsed}
    >
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
          label={t('guide.header.brand')}
          value={guide.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
          placeholder={t('guide.header.brandPlaceholder')}
          hint={t('guide.header.brandHint')}
        />
        <SelectField
          label={t('guide.header.country')}
          value={guide.country}
          onChange={(event) => onChange({ country: event.target.value })}
          hint={t('guide.header.countryHint')}
        >
          <option value="">{t('guide.header.countryEmpty')}</option>
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {t(option.labelKey)}
            </option>
          ))}
        </SelectField>
      </div>
    </SectionCard>
  );
}
