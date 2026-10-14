import React from 'react';
import {
  AlertTriangle,
  Building2,
  Clock,
  ShieldAlert,
  Radio,
  FileCheck2,
  Tag,
  MapPin,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { AIAnalysisResult, IssueCategory, PriorityLevel } from '../types';

interface AIAnalysisCardProps {
  analysis: AIAnalysisResult;
  category?: IssueCategory;
  location?: string;
  onSaveReport: () => void;
  onScanDuplicates: () => void;
  onDismiss: () => void;
  isSaving?: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  category,
  location,
  onSaveReport,
  onScanDuplicates,
  onDismiss,
  isSaving,
}) => {
  const getPriorityMeta = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return {
          symbol: '◆',
          code: 'CRIT',
          label: 'CRITICAL',
          subtext: 'Immediate Threat / Emergency Protocol',
          borderColor: 'border-rose-500/60',
          badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
          textColor: 'text-rose-400',
        };
      case 'High':
        return {
          symbol: '▲',
          code: 'HIGH',
          label: 'HIGH',
          subtext: 'Severe Hazard / Active Public Risk',
          borderColor: 'border-amber-500/60',
          badgeBg: 'bg-amber-950 text-amber-300 border-amber-800',
          textColor: 'text-amber-400',
        };
      case 'Medium':
        return {
          symbol: '●',
          code: 'MED',
          label: 'MEDIUM',
          subtext: 'Routine Degradation / Standard SLA',
          borderColor: 'border-cyan-500/60',
          badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-800',
          textColor: 'text-cyan-400',
        };
      case 'Low':
      default:
        return {
          symbol: '■',
          code: 'LOW',
          label: 'LOW',
          subtext: 'Cosmetic / Scheduled Maintenance',
          borderColor: 'border-emerald-500/60',
          badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
          textColor: 'text-emerald-400',
        };
    }
  };

  const pMeta = getPriorityMeta(analysis.priority);

  return (
    <div className={`mt-5 rounded-lg bg-slate-900/95 border ${pMeta.borderColor} p-5 shadow-xl text-slate-200 transition-all`}>
      {/* Top Banner Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
              OPS TRIAGE REPORT
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-bold text-white font-mono">
              CIVICLENS AI ASSESSMENT
            </span>
            {category && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 text-teal-300 border border-slate-750">
                CAT: {category}
              </span>
            )}
            {location && (
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 text-cyan-300 border border-slate-750 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {location}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated municipal classification, severity scoring, and dispatch recommendations.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss analysis"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Triage Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {/* Module 1: Priority & Safety Hazard */}
        <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              SEVERITY LEVEL
            </span>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${pMeta.badgeBg}`}>
              {pMeta.symbol} [{pMeta.code}] {pMeta.label}
            </span>
          </div>

          <div className="pt-1">
            <div className="text-xs font-semibold text-slate-200">{pMeta.subtext}</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {analysis.priorityReason}
            </div>
          </div>

          {analysis.safetyHazardLevel && (
            <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">HAZARD INDEX:</span>
              <span className="font-bold text-amber-300">{analysis.safetyHazardLevel}</span>
            </div>
          )}
        </div>

        {/* Module 2: Department Routing & SLA */}
        <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              ASSIGNED DEPARTMENT
            </span>
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="pt-1">
            <div className="text-xs font-bold text-teal-300 leading-snug">
              {analysis.responsibleDepartment}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-850 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">SLA TARGET:</span>
              <span className="text-slate-200 font-semibold">{analysis.estimatedResolutionHours || 'Standard SLA'}</span>
            </div>
          </div>
        </div>

        {/* Module 3: Executive Summary */}
        <div className="p-3.5 rounded bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              EXECUTIVE SUMMARY
            </span>
            <span className="text-[10px] font-mono text-slate-500">DISPATCH READY</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{analysis.summary}"
          </p>

          {analysis.suggestedTags && analysis.suggestedTags.length > 0 && (
            <div className="pt-2 border-t border-slate-850 flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-slate-400">
              <Tag className="w-3 h-3 text-slate-500" />
              {analysis.suggestedTags.map((tag, i) => (
                <span key={i} className="text-slate-300">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Field Remediation Workplan */}
      <div className="p-3.5 rounded bg-slate-950 border border-slate-800 text-xs mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
          RECOMMENDED REMEDIATION ACTIONS FOR CREW:
        </span>
        <p className="text-slate-300 leading-relaxed font-sans">
          {analysis.recommendedAction}
        </p>
      </div>

      {/* Operational Action Bar */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Priority requires human staff review before field dispatch</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Check Duplicate Radar button */}
          <button
            type="button"
            onClick={onScanDuplicates}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-slate-700 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>Scan Radar</span>
          </button>

          {/* Confirm & Save Button */}
          <button
            type="button"
            onClick={onSaveReport}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>FILING TICKET...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>CONFIRM & FILE REPORT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
