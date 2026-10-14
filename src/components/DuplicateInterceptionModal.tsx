import React from 'react';
import {
  AlertTriangle,
  ThumbsUp,
  FilePlus2,
  X,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CivicReport, IssueCategory } from '../types';

interface DuplicateInterceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchingReport: CivicReport;
  similarityScore: number;
  matchReasons: string[];
  newComplaint: {
    category: IssueCategory;
    location: string;
    description: string;
    reporterName?: string;
  };
  onLinkToExisting: (existingReportId: string) => void;
  onConfirmFileAnyway: () => void;
  isSaving?: boolean;
}

export const DuplicateInterceptionModal: React.FC<DuplicateInterceptionModalProps> = ({
  isOpen,
  onClose,
  matchingReport,
  similarityScore,
  matchReasons,
  newComplaint,
  onLinkToExisting,
  onConfirmFileAnyway,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 shadow-2xl rounded-lg overflow-hidden ring-1 ring-amber-500/20 text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  CIVIC RADAR INTERCEPT
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  {similarityScore}% MATCH
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Matching Report Already Exists: Ticket #{matchingReport.id}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-slate-300 leading-relaxed">
            CivicLens detected that an identical or matching municipal incident is already logged in the registry.
            To avoid dispatching duplicate field crews, you can <strong>upvote and endorse the existing ticket</strong> (+1 citizen priority), or proceed to file a separate ticket if this represents a distinct hazard.
          </p>

          {/* Comparison Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Existing Ticket */}
            <div className="p-3.5 rounded border border-amber-500/30 bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                <span className="font-mono text-[11px] font-bold text-amber-400">
                  ACTIVE TICKET: #{matchingReport.id}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {matchingReport.status}
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{matchingReport.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{matchingReport.category}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{new Date(matchingReport.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-3 italic pt-1 border-t border-slate-800/80">
                  "{matchingReport.description}"
                </p>
                <div className="pt-1 text-[11px] text-amber-300 flex items-center gap-1 font-semibold">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Current Endorsements: {matchingReport.citizenUpvotes || 1} upvotes</span>
                </div>
              </div>
            </div>

            {/* Incoming Complaint */}
            <div className="p-3.5 rounded border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  YOUR INCOMING REPORT
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-400">
                  NEW
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">{newComplaint.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{newComplaint.category}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-3 italic pt-1 border-t border-slate-800/80">
                  "{newComplaint.description}"
                </p>
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px]">
              <span className="font-mono uppercase font-bold text-slate-400 tracking-wider block mb-1">
                EVALUATED FACTORS:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {matchReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Override Option */}
            <button
              type="button"
              onClick={onConfirmFileAnyway}
              disabled={isSaving}
              title="Confirm that this is a separate incident and create a new ticket"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isSaving ? 'Filing Ticket...' : 'File as Separate Ticket Anyway'}</span>
            </button>

            {/* Upvote & Link Option (Recommended) */}
            <button
              type="button"
              onClick={() => onLinkToExisting(matchingReport.id)}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Upvote & Link to #{matchingReport.id}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
