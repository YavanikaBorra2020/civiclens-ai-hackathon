import React from 'react';
import {
  Radio,
  FileSpreadsheet,
  RotateCcw,
  Activity,
  Terminal,
} from 'lucide-react';

interface NavbarProps {
  onExportCSV: () => void;
  onResetData: () => void;
  reportsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportCSV,
  onResetData,
  reportsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-850 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-slate-900 border border-teal-500/50 text-teal-400 shadow-sm shadow-teal-500/10">
            <Radio className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                CIVIC<span className="text-teal-400">LENS</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal border-l border-slate-700 pl-1.5">
                  OPS CONTROL
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-slate-900 text-teal-400 border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5 animate-pulse" />
                Live Node
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              Automated Complaint Triage & Duplicate Radar Console
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Engine Status Tag */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Gemini Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-teal-400">{reportsCount} active</span>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            title="Download CSV export of all complaint records"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 hover:border-teal-500/50 transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline font-mono text-[11px]">EXPORT CSV</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset to pristine sample records"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline font-mono text-[11px]">RESET DEMO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
