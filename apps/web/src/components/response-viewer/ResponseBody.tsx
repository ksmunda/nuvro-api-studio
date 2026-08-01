import React, { useState } from 'react';

interface ResponseBodyProps {
  body: string;
  contentType: string;
}

export function ResponseBody({ body, contentType }: ResponseBodyProps) {
  const [isWrapped, setIsWrapped] = useState(false);
  const [copied, setCopied] = useState(false);

  const getFormattedBody = () => {
    if (!body) return 'No response body returned';

    // JSON Pretty Print
    if (contentType.includes('application/json') || body.trim().startsWith('{') || body.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // Fall back to raw string if parsing fails
        return body;
      }
    }

    return body;
  };

  const formatted = getFormattedBody();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fail silently
    }
  };

  return (
    <div className="space-y-3">
      {/* Body Actions Bar */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={() => setIsWrapped(!isWrapped)}
          className="text-surface-400 hover:text-brand-400 font-semibold px-2 py-1 bg-surface-800/40 hover:bg-surface-800 rounded transition-colors"
        >
          {isWrapped ? 'Unwrap Text' : 'Wrap Text'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="text-surface-400 hover:text-brand-400 font-semibold px-2 py-1 bg-surface-800/40 hover:bg-surface-800 rounded transition-colors flex items-center gap-1"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Editor Viewer Panel */}
      <div className="relative border border-surface-800 rounded-lg bg-surface-950 overflow-hidden">
        <pre
          className={`p-4 text-xs font-mono text-surface-200 overflow-auto max-h-[450px] ${
            isWrapped ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
          }`}
        >
          {/* Output text is escaped/rendered via JSX text node directly - prevents any HTML injection */}
          {formatted}
        </pre>
      </div>
    </div>
  );
}
