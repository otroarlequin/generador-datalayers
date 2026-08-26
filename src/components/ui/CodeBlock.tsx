import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/context/SettingsContext';
import { copyToClipboard } from '@/utils/helpers';

type CodeBlockProps = {
  code: string;
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(code);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#111111] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/60">
          {label ?? t('code.script')}
        </span>
        <Button
          variant="ghost"
          className="!px-2 !py-1 text-xs text-white/80 hover:!bg-white/10 hover:!text-white"
          onClick={() => void handleCopy()}
        >
          {copied ? t('code.copied') : t('code.copy')}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-emerald-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
