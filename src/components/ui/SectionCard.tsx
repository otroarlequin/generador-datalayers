import { useState, type ReactNode } from 'react';
import { useT } from '@/context/SettingsContext';

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  optional?: boolean;
  defaultOpen?: boolean;
  collapsible?: boolean;
};

export function SectionCard({
  title,
  description,
  children,
  action,
  optional = false,
  defaultOpen = true,
  collapsible = false,
}: SectionCardProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const optionalBadge = optional ? (
    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-subtle">
      {t('event.optional')}
    </span>
  ) : null;

  if (collapsible) {
    return (
      <details
        open={isOpen}
        onToggle={(event) => {
          setIsOpen((event.currentTarget as HTMLDetailsElement).open);
        }}
        className="rounded-xl border border-border bg-surface-raised"
      >
        <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                {optionalBadge}
              </div>
              {description ? (
                <p className="mt-1 text-sm text-ink-muted">{description}</p>
              ) : null}
            </div>
            {action}
          </div>
        </summary>
        <div
          className="border-t border-border px-5 py-4"
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </details>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface-raised">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {optionalBadge}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="border-t border-border px-5 py-4">{children}</div>
    </section>
  );
}
