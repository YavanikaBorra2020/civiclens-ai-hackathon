import React from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hammer,
  Trash2,
  Droplets,
  Lightbulb,
  Waves,
  HelpCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import { CivicReport, IssueCategory, PriorityLevel } from '../types';
import { isSameCategory } from '../utils/categories';

interface DashboardStatsProps {
  reports: CivicReport[];
  selectedCategory: IssueCategory | 'ALL';
  onSelectCategory: (category: IssueCategory | 'ALL') => void;
  selectedPriority: PriorityLevel | 'ALL';
  onSelectPriority: (priority: PriorityLevel | 'ALL') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  reports,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
}) => {
  const totalReports = reports.length;

  const criticalReports = reports.filter(
    (r) => r.aiAnalysis?.priority === 'Critical'
  ).length;

  const highReports = reports.filter(
    (r) => r.aiAnalysis?.priority === 'High'
  ).length;

  const totalHighPriority = criticalReports + highReports;

  const inProgressReports = reports.filter(
    (r) => r.status === 'In Progress' || r.status === 'Dispatched' || r.status === 'In Triage'
  ).length;

  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;

  const categories: {
    key: IssueCategory;
    label: string;
    icon: React.ReactNode;
    code: string;
  }[] = [
    {
      key: 'Potholes',
      label: 'Potholes',
      icon: <Hammer className="w-3.5 h-3.5 text-amber-400" />,
      code: 'ROAD',
    },
    {
      key: 'Garbage',
      label: 'Garbage & Waste',
      icon: <Trash2 className="w-3.5 h-3.5 text-emerald-400" />,
      code: 'SAN',
    },
    {
      key: 'Water Leakage',
      label: 'Water Leakage',
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" />,
      code: 'WTR',
    },
    {
      key: 'Streetlights',
      label: 'Streetlights',
      icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />,
      code: 'LGT',
    },
    {
      key: 'Drainage',
      label: 'Drainage',
      icon: <Waves className="w-3.5 h-3.5 text-teal-400" />,
      code: 'FLOD',
    },
    {
      key: 'Other',
      label: 'Other',
      icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />,
      code: 'GEN',
    },
  ];

  return (
    <section className="mb-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {/* Total Reports */}
        <div
          onClick={() => {
            onSelectCategory('ALL');
            onSelectPriority('ALL');
          }}
          className={`cursor-pointer rounded-lg border p-3.5 bg-slate-900/95 transition-all text-left relative ${
            selectedCategory === 'ALL' && selectedPriority === 'ALL'
              ? 'border-teal-500/80 ring-1 ring-teal-500/30'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>TOTAL REGISTRY</span>
            <span className="text-teal-400 font-bold">[ALL]</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {totalReports}
            </span>
            <span className="text-[11px] text-slate-400">tickets</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-teal-400 font-mono flex items-center justify-between">
            <span>CLICK TO RESET FILTERS</span>
            <FileText className="w-3 h-3" />
          </div>
        </div>

        {/* High & Critical Priority */}
        <div
          onClick={() =>
            onSelectPriority(selectedPriority === 'High' ? 'ALL' : 'High')
          }
          className={`cursor-pointer rounded-lg border p-3.5 bg-slate-900/95 transition-all text-left ${
            selectedPriority === 'High' || selectedPriority === 'Critical'
              ? 'border-rose-500/80 ring-1 ring-rose-500/30'
              : 'border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-rose-300 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              HIGH & CRITICAL
            </span>
            <span className="text-rose-400 font-bold">[PRIO]</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-300 tracking-tight font-mono">
              {totalHighPriority}
            </span>
            <span className="text-[11px] text-slate-400">
              ({criticalReports} crit / {highReports} high)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-rose-400/90 font-mono flex items-center justify-between">
            <span>EXPEDITED ATTENTION</span>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
          </div>
        </div>

        {/* Active In Field */}
        <div className="rounded-lg border border-slate-800 p-3.5 bg-slate-900/95 text-left">
          <div className="flex items-center justify-between text-cyan-300 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>FIELD DISPATCH</span>
            <span className="text-cyan-400 font-bold">[LIVE]</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight font-mono">
              {inProgressReports}
            </span>
            <span className="text-[11px] text-slate-400">crews queued</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400/90 font-mono flex items-center justify-between">
            <span>TRIAGE & FIELD ACTIVE</span>
            <Clock className="w-3 h-3 text-cyan-400" />
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-lg border border-slate-800 p-3.5 bg-slate-900/95 text-left">
          <div className="flex items-center justify-between text-emerald-300 text-[10px] font-mono uppercase tracking-wider mb-2">
            <span>REMEDIATION RATE</span>
            <span className="text-emerald-400 font-bold">[DONE]</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight font-mono">
              {resolvedReports}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}% cleared)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-400/90 font-mono flex items-center justify-between">
            <span>RESOLVED & VERIFIED</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Category Operations Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1.5 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              CATEGORY OPERATIONS DISTRIBUTION
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              (click category to filter registry)
            </span>
          </div>

          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => onSelectCategory('ALL')}
              className="text-[11px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>[RESET FILTER: {selectedCategory}]</span>
            </button>
          )}
        </div>

        {/* Category Operational Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map((cat) => {
            const count = reports.filter((r) => isSameCategory(r.category, cat.key)).length;
            const isSelected = selectedCategory !== 'ALL' && isSameCategory(selectedCategory, cat.key);
            const percent = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'ALL' : cat.key)}
                className={`flex flex-col p-2.5 rounded border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500 shadow-sm ring-1 ring-teal-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    [{cat.code}]
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      count > 0
                        ? 'bg-slate-900 text-teal-300 border-slate-700'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 my-1 text-slate-200">
                  <div className="shrink-0">{cat.icon}</div>
                  <span className="text-xs font-semibold truncate">
                    {cat.label}
                  </span>
                </div>

                {/* Micro Progress Gauge */}
                <div className="w-full bg-slate-900 h-1.5 rounded-xs overflow-hidden mt-1 border border-slate-800">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                  <span>SHARE</span>
                  <span>{percent}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
