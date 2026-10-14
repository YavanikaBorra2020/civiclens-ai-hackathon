import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-950/40 border-b border-amber-850/60 text-amber-200 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="leading-snug text-[11px] text-amber-200/90">
            <span className="font-mono font-bold uppercase text-[10px] mr-1.5 px-1 py-0.2 rounded bg-amber-900/60 text-amber-300 border border-amber-700/60">
              PROTOTYPE ADVISORY
            </span>
            CivicLens AI is an infrastructure evaluation prototype. AI priority rankings and department routing are advisory and{' '}
            <strong className="text-amber-300 font-semibold">require human municipal staff verification</strong>. Reports are stored locally in browser storage and are{' '}
            <strong className="text-amber-300 font-semibold">not dispatched to real emergency or municipal agencies</strong>.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/70 hover:text-amber-200 p-0.5 rounded hover:bg-amber-900/40 shrink-0 transition-colors cursor-pointer"
          title="Dismiss advisory notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
