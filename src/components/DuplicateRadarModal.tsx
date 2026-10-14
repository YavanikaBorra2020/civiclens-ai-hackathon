import React from 'react';
import {
  Radio,
  AlertCircle,
  ThumbsUp,
  X,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { CivicReport, DuplicateRadarResult, DuplicateRadarMatch } from '../types';

interface DuplicateRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  radarResult: DuplicateRadarResult | null;
  isLoading: boolean;
  error: string | null;
  existingReports: CivicReport[];
  onLinkToExisting: (existingReportId: string) => void;
  onProceedAsNew: () => void;
}

export const DuplicateRadarModal: React.FC<DuplicateRadarModalProps> = ({
  isOpen,
  onClose,
  radarResult,
  isLoading,
  error,
  existingReports,
  onLinkToExisting,
  onProceedAsNew,
}) => {
  if (!isOpen) return null;

  const reportMap = new Map(existingReports.map((r) => [r.id, r]));

  // Strict deduplication & registry verification
  const seenIds = new Set<string>();
  const validatedMatches: DuplicateRadarMatch[] = (radarResult?.matches || []).filter((m) => {
    if (!m || !m.reportId) return false;
    if (!reportMap.has(m.reportId)) return false; // Must exist in registry
    if (seenIds.has(m.reportId)) return false; // No duplicate entries
    seenIds.add(m.reportId);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-slate-900 border border-slate-750 shadow-2xl overflow-hidden ring-1 ring-teal-500/20 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 border border-teal-500/50 text-teal-400">
              <Radio className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                  RADAR SCANNER
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  SPATIAL & SEMANTIC
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Duplicate Incident Detection Console
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Radar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Radar Status Bar */}
          <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2.5 text-teal-400 text-xs font-mono py-4">
                <svg className="animate-spin h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>SCANNING REGISTRY FOR SPATIAL & PROBLEM SIMILARITY...</span>
              </div>
            ) : error ? (
              <div className="text-rose-400 text-xs font-mono flex items-center justify-center gap-1.5 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : radarResult ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        validatedMatches.length > 0
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                      }`}
                    >
                      {validatedMatches.length > 0
                        ? `POTENTIAL DUPLICATES DETECTED (${validatedMatches.length})`
                        : 'UNIQUE CIVIC INCIDENT VERIFIED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-sans">
                    {radarResult.radarAnalysisSummary}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Matches List */}
          {validatedMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  MATCHING REGISTRY TICKETS ({validatedMatches.length})
                </span>
                <span className="text-[11px]">Compare before dispatching duplicate crews</span>
              </div>

              {validatedMatches.map((match: DuplicateRadarMatch, idx) => {
                const report = reportMap.get(match.reportId);

                return (
                  <div
                    key={match.reportId || idx}
                    className="p-4 rounded border border-slate-800 bg-slate-950/90 hover:border-slate-700 transition-all space-y-3"
                  >
                    {/* Header Row: Score & Tags */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-750">
                          #{match.reportId}
                        </span>
                        {report && (
                          <span className="text-[11px] text-slate-300 font-medium">
                            {report.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            match.matchConfidence === 'High'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : match.matchConfidence === 'Medium'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-900 text-slate-400 border border-slate-750'
                          }`}
                        >
                          {match.matchConfidence} CONFIDENCE
                        </span>
                      </div>

                      {/* Similarity Meter */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {match.similarityScore}% MATCH
                        </span>
                        <div className="w-20 h-1.5 rounded-xs bg-slate-800 overflow-hidden border border-slate-750">
                          <div
                            className={`h-full ${
                              match.similarityScore >= 80
                                ? 'bg-rose-500'
                                : match.similarityScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-teal-500'
                            }`}
                            style={{ width: `${match.similarityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verdict Box */}
                    <div className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-900/40 rounded p-2.5 font-mono">
                      <span className="font-bold text-amber-300">RADAR VERDICT:</span> {match.verdict}
                    </div>

                    {/* Match Reasons */}
                    {match.matchReasons && match.matchReasons.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                          MATCH FACTORS:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {match.matchReasons.map((r, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-sans"
                            >
                              • {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Snapshot if found in state */}
                    {report && (
                      <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                          <span className="flex items-center gap-1 text-slate-200">
                            <MapPin className="w-3 h-3 text-teal-400" />
                            {report.location}
                          </span>
                          <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 italic text-[11px] line-clamp-2">
                          "{report.description}"
                        </p>
                      </div>
                    )}

                    {/* Actions for this match */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onLinkToExisting(match.reportId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Upvote & Link to Ticket #{match.reportId}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No matches state */}
          {radarResult && validatedMatches.length === 0 && !isLoading && (
            <div className="text-center p-6 rounded bg-emerald-950/20 border border-emerald-900/40">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white font-mono">UNIQUE CIVIC HAZARD CONFIRMED</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No active municipal tickets match this location and problem profile. This report appears to be a distinct new incident.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            [CLOSE RADAR]
          </button>

          <button
            type="button"
            onClick={onProceedAsNew}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer font-mono"
          >
            <span>PROCEED WITH NEW REPORT FILING</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
