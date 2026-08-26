import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldClass =
  'w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft';

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
  required?: boolean;
};

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="text-sm font-medium text-ink">
      {label}
      {required ? <span className="ml-0.5 text-danger">*</span> : null}
    </span>
  );
}

export function TextField({
  label,
  hint,
  className = '',
  required,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel label={label} required={required} />
      <input className={fieldClass} required={required} {...props} />
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className = '',
  required,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel label={label} required={required} />
      <textarea className={`${fieldClass} min-h-24 resize-y`} required={required} {...props} />
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  hint,
  className = '',
  required,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <FieldLabel label={label} required={required} />
      <select className={fieldClass} required={required} {...props}>
        {children}
      </select>
      {hint ? <span className="text-xs text-ink-subtle">{hint}</span> : null}
    </label>
  );
}
