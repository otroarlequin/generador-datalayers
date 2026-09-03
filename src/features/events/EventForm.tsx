import { useState } from 'react';
import {
  INTERACTION_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STRUCTURE_TYPE_OPTIONS,
} from '@/constants';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { SectionCard } from '@/components/ui/SectionCard';
import { useT } from '@/context/SettingsContext';
import { generateDataLayerScript } from '@/generators/scriptGenerator';
import { saveEventToLibraryFromGuide } from '@/services/export/exportService';
import type { EventStructureType, MeasurementEvent, MeasurementGuide } from '@/types';
import {
  createCustomParam,
  createDataLayerVariable,
} from '@/utils/factory';
import { fileToDataUrl } from '@/utils/helpers';

type EventFormProps = {
  event: MeasurementEvent;
  guide: MeasurementGuide;
  onChange: (patch: Partial<MeasurementEvent>) => void;
  onBackToStart?: () => void;
};

export function EventForm({ event, guide, onChange, onBackToStart }: EventFormProps) {
  const t = useT();
  const script = generateDataLayerScript(event);
  const [libraryStatus, setLibraryStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleStructureChange(value: EventStructureType) {
    const option = STRUCTURE_TYPE_OPTIONS.find((item) => item.value === value);
    onChange({
      structureType: value,
      event: option?.eventValue ?? (value === 'custom' ? event.event : ''),
    });
  }

  async function handleScreenshot(file: File | null) {
    if (!file) {
      onChange({ screenshotDataUrl: undefined });
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    onChange({ screenshotDataUrl: dataUrl });
  }

  async function handleSaveToLibrary() {
    setSaving(true);
    setLibraryStatus(null);
    try {
      await saveEventToLibraryFromGuide(event, guide);
      setLibraryStatus(t('event.savedToLibrary'));
    } catch (error) {
      setLibraryStatus(
        error instanceof Error ? error.message : t('event.saveToLibraryError'),
      );
    } finally {
      setSaving(false);
    }
  }

  function structureHelpKey(type: EventStructureType): string {
    if (type === 'ua') return 'event.structureHelp.ua';
    if (type === 'ni') return 'event.structureHelp.ni';
    return 'event.structureHelp.custom';
  }

  function updateVariable(
    variableId: string,
    patch: Partial<MeasurementEvent['requiredVariables'][number]>,
  ) {
    onChange({
      requiredVariables: event.requiredVariables.map((item) =>
        item.id === variableId ? { ...item, ...patch } : item,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">{t('event.formHint')}</p>
        <Button disabled={saving} onClick={() => void handleSaveToLibrary()}>
          {saving ? t('event.savingToLibrary') : t('event.saveToLibrary')}
        </Button>
      </div>
      {libraryStatus ? (
        <p className="rounded-md border border-teal-200 bg-accent-soft px-3 py-2 text-sm text-teal-900 dark:border-teal-900 dark:text-teal-100">
          {libraryStatus}
        </p>
      ) : null}

      <SectionCard title={t('event.identity')} description={t('event.identityDesc')}>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label={t('event.name')}
            required
            value={event.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('event.namePlaceholder')}
          />
          <SelectField
            label={t('event.priority')}
            value={event.priority}
            onChange={(e) =>
              onChange({ priority: e.target.value as MeasurementEvent['priority'] })
            }
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label={t('event.interaction')}
            value={event.interactionType}
            onChange={(e) => onChange({ interactionType: e.target.value })}
            className="md:col-span-2"
          >
            {INTERACTION_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
          <TextAreaField
            label={t('event.description')}
            value={event.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="md:col-span-2"
            placeholder={t('event.descriptionPlaceholder')}
          />
          <TextAreaField
            label={t('event.businessObjective')}
            value={event.businessObjective ?? ''}
            onChange={(e) => onChange({ businessObjective: e.target.value })}
            className="md:col-span-2"
            placeholder={t('event.businessObjectivePlaceholder')}
          />
        </div>
      </SectionCard>

      <SectionCard title={t('event.structure')} description={t('event.structureDesc')}>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label={t('event.structureType')}
            value={event.structureType}
            onChange={(e) =>
              handleStructureChange(e.target.value as EventStructureType)
            }
          >
            {STRUCTURE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label={t('event.event')}
            required
            value={event.event}
            onChange={(e) => onChange({ event: e.target.value })}
            disabled={event.structureType !== 'custom'}
            placeholder="purchase"
            hint={
              event.structureType === 'custom'
                ? t('event.eventCustomHint')
                : t('event.eventFixedHint')
            }
          />
        </div>

        <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-3 text-sm text-ink-muted">
          {t(structureHelpKey(event.structureType))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            label={t('event.eventName')}
            required
            value={event.event_name}
            onChange={(e) => onChange({ event_name: e.target.value })}
            placeholder="form_submit"
          />
          <TextField
            label={t('event.eventCategory')}
            value={event.eventCategory}
            onChange={(e) => onChange({ eventCategory: e.target.value })}
            placeholder="Form"
          />
          <TextField
            label={t('event.eventAction')}
            value={event.eventAction}
            onChange={(e) => onChange({ eventAction: e.target.value })}
            placeholder="Submit"
          />
          <TextField
            label={t('event.eventLabel')}
            value={event.eventLabel}
            onChange={(e) => onChange({ eventLabel: e.target.value })}
            placeholder="Contact"
          />
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{t('event.customParams')}</p>
              <p className="text-xs text-ink-subtle">{t('event.customParamsHint')}</p>
            </div>
            <Button
              onClick={() =>
                onChange({
                  customParams: [...event.customParams, createCustomParam()],
                })
              }
            >
              {t('event.addParam')}
            </Button>
          </div>
          {event.customParams.length === 0 ? (
            <p className="text-sm text-ink-subtle">{t('event.noParams')}</p>
          ) : (
            <div className="space-y-2">
              {event.customParams.map((param) => (
                <div key={param.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <TextField
                    label={t('event.key')}
                    value={param.key}
                    onChange={(e) =>
                      onChange({
                        customParams: event.customParams.map((item) =>
                          item.id === param.id ? { ...item, key: e.target.value } : item,
                        ),
                      })
                    }
                  />
                  <TextField
                    label={t('event.value')}
                    value={param.value}
                    onChange={(e) =>
                      onChange({
                        customParams: event.customParams.map((item) =>
                          item.id === param.id ? { ...item, value: e.target.value } : item,
                        ),
                      })
                    }
                  />
                  <div className="flex items-end">
                    <Button
                      variant="danger"
                      onClick={() =>
                        onChange({
                          customParams: event.customParams.filter(
                            (item) => item.id !== param.id,
                          ),
                        })
                      }
                    >
                      {t('event.remove')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title={t('event.screenshot')} description={t('event.screenshotDesc')}>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void handleScreenshot(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          />
          {event.screenshotDataUrl ? (
            <div className="space-y-2">
              <img
                src={event.screenshotDataUrl}
                alt={t('event.screenshotAlt')}
                className="max-h-64 rounded-lg border border-border object-contain"
              />
              <Button
                variant="danger"
                onClick={() => onChange({ screenshotDataUrl: undefined })}
              >
                {t('event.removeScreenshot')}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-ink-subtle">{t('event.noScreenshot')}</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title={t('event.howItTriggers')} description={t('event.howItTriggersDesc')}>
        <TextAreaField
          label={t('event.howItTriggersLabel')}
          required
          value={event.howItTriggers}
          onChange={(e) => onChange({ howItTriggers: e.target.value })}
          placeholder={t('event.howItTriggersPlaceholder')}
        />
      </SectionCard>

      <SectionCard title={t('event.script')} description={t('event.scriptDesc')}>
        <CodeBlock code={script} />
      </SectionCard>

      <SectionCard
        title={t('event.dictionary')}
        description={t('event.dictionaryDesc')}
        optional
        action={
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange({
                requiredVariables: [
                  ...event.requiredVariables,
                  createDataLayerVariable(),
                ],
              });
            }}
          >
            {t('event.addVariable')}
          </Button>
        }
      >
        {event.requiredVariables.length === 0 ? (
          <p className="text-sm text-ink-subtle">{t('event.dictionaryEmpty')}</p>
        ) : (
          <div className="space-y-3">
            {event.requiredVariables.map((variable) => (
              <div
                key={variable.id}
                className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_1.4fr_1fr_auto_auto]"
              >
                <TextField
                  label={t('event.variable')}
                  value={variable.name}
                  onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                />
                <TextField
                  label={t('event.variableDescription')}
                  value={variable.description}
                  onChange={(e) =>
                    updateVariable(variable.id, { description: e.target.value })
                  }
                />
                <TextField
                  label={t('event.example')}
                  value={variable.example}
                  onChange={(e) =>
                    updateVariable(variable.id, { example: e.target.value })
                  }
                />
                <SelectField
                  label={t('event.requiredVar')}
                  value={variable.required ? 'yes' : 'no'}
                  onChange={(e) =>
                    updateVariable(variable.id, { required: e.target.value === 'yes' })
                  }
                >
                  <option value="yes">{t('event.yes')}</option>
                  <option value="no">{t('event.no')}</option>
                </SelectField>
                <div className="flex items-end">
                  <Button
                    variant="danger"
                    onClick={() =>
                      onChange({
                        requiredVariables: event.requiredVariables.filter(
                          (item) => item.id !== variable.id,
                        ),
                      })
                    }
                  >
                    {t('event.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {onBackToStart ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-4">
          <p className="text-sm text-ink-muted">{t('event.backToStartHint')}</p>
          <Button className="mt-3" variant="primary" onClick={onBackToStart}>
            {t('event.backToStart')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
