import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from '../ui/button';

const COPIED_FEEDBACK_MS = 2000;

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string;
  label?: string;
}

/**
 * Copies `value` to the clipboard and briefly confirms in place.
 */
export function CopyButton({ value, label = 'Copy', disabled, ...props }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timeout = window.setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setStatus('failed');
    }
  };

  return (
    <Button {...props} disabled={disabled || !value} onClick={() => void handleCopy()}>
      {status === 'copied' ? <Check /> : <Copy />}
      {status === 'copied' ? 'Copied!' : status === 'failed' ? 'Copy failed' : label}
    </Button>
  );
}
