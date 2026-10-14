import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ThumbsUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { CivicReport, IssueCategory, PriorityLevel, ReportStatus } from '../types';
import { isSameCategory } from '../utils/categories';

interface ReportsTableProps {
  reports: CivicReport[];
  selectedCategory: IssueCategory | 'ALL';
  onSelectCategory: (cat: IssueCategory | 'ALL') => void;
  selectedPriority: PriorityLevel | 'ALL';
  onSelectPriority: (prio: PriorityLevel | 'ALL') => void;
  onUpvoteReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ReportStatus) => void;
  onExportCSV: () => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  selectedCategory,
  onSelectCategory,
  selectedPriority,
  onSelectPriority,
  onUpvoteReport,
  onDeleteReport,
  onUpdateStatus,
  onExportCSV,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Category filter
      if (selectedCategory !== 'ALL' && !isSameCategory(r.category, selectedCategory)) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'ALL' && r.aiAnalysis?.priority !== selectedPriority) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesLoc = r.location.toLowerCase().includes(query);
        const matchesDept = r.aiAnalysis?.responsibleDepartment.toLowerCase().includes(query) || false;
        const matchesSummary = r.aiAnalysis?.summary.toLowerCase().includes(query) || false;
        const matchesReporter = r.reporterName?.toLowerCase().includes(query) || false;

        return matchesId || matchesDesc || matchesLoc || matchesDept || matchesSummary || matchesReporter;
      }
      return true;
    });
  }, [reports, selectedCategory, selectedPriority, statusFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedReportId((prev) => (prev === id ? null : id));
  };

  const getPriorityBadge = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            <span className="text-rose-400">◆</span>
            <span>[CRIT] Critical</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            <span className="text-amber-400">▲</span>
            <span>[HIGH] High</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            <span className="text-cyan-400">●</span>
            <span>[MED] Medium</span>
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            <span className="text-emerald-400">■</span>
            <span>[LOW] Low</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            <span>[--] Pending</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReportStatus, reportId: string) => {
    const statuses: ReportStatus[] = [
      'Submitted',
      'In Triage',
      'Dispatched',
      'In Progress',
      'Resolved',
    ];

    const getStatusColor = (s: ReportStatus) => {
      switch (s) {
        case 'Resolved':
          return 'text-emerald-300 bg-emerald-950/70 border-emerald-800';
        case 'In Progress':
        case 'Dispatched':
          return 'text-cyan-300 bg-cyan-950/70 border-cyan-800';
        case 'In Triage':
          return 'text-amber-300 bg-amber-950/70 border-amber-800';
        default:
          return 'text-slate-300 bg-slate-900 border-slate-750';
      }
    };

    return (
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => onUpdateStatus(reportId, e.target.value as ReportStatus)}
          className={`text-[10px] font-mono font-semibold px-2 py-1 rounded border appearance-none cursor-pointer pr-5 focus:outline-none focus:ring-1 focus:ring-teal-500 ${getStatusColor(
            status
          )}`}
          title="Update operational status"
        >
          {statuses.map((s) => (
            <option key={s} value={s} className="bg-slate-900 text-slate-100 font-sans">
              {s}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400">
          <ChevronDown className="w-2.5 h-2.5" />
        </div>
      </div>
    );
  };

  return (
    <section className="bg-slate-900/95 border border-slate-800 rounded-lg p-5 shadow-xl">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              MUNICIPAL INCIDENT REGISTRY
            </h2>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-teal-400 border border-slate-800 font-bold">
              {filteredReports.length} {filteredReports.length === 1 ? 'RECORD' : 'RECORDS'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active civic infrastructure database with AI-assigned priority rankings and operational status tracking.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by ID, street, keyword..."
              className="w-full bg-slate-950 border border-slate-750 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => onSelectPriority(e.target.value as PriorityLevel | 'ALL')}
            className="bg-slate-950 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer font-mono"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="Critical">CRITICAL</option>
            <option value="High">HIGH</option>
            <option value="Medium">MEDIUM</option>
            <option value="Low">LOW</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
            className="bg-slate-950 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer font-mono"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Submitted">SUBMITTED</option>
            <option value="In Triage">IN TRIAGE</option>
            <option value="Dispatched">DISPATCHED</option>
            <option value="In Progress">IN PROGRESS</option>
            <option value="Resolved">RESOLVED</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-950 border border-slate-750 hover:border-teal-500/50 text-slate-200 hover:text-teal-300 transition-colors cursor-pointer"
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono text-[11px]">CSV</span>
          </button>
        </div>
      </div>

      {/* Reports List: Table-first Layout */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="w-10 h-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-200 font-mono uppercase">No complaints match search filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, priority filters, or category selections.
          </p>
          {(selectedCategory !== 'ALL' || selectedPriority !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                onSelectCategory('ALL');
                onSelectPriority('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1 rounded bg-slate-800 text-teal-300 text-xs font-mono font-semibold hover:bg-slate-750 transition-colors cursor-pointer"
            >
              [RESET ALL FILTERS]
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          {/* Table Container */}
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">TICKET ID</th>
                <th className="py-2.5 px-3 font-semibold">CATEGORY</th>
                <th className="py-2.5 px-3 font-semibold">LOCATION</th>
                <th className="py-2.5 px-3 font-semibold">CITIZEN DESCRIPTION</th>
                <th className="py-2.5 px-3 font-semibold">SEVERITY</th>
                <th className="py-2.5 px-3 font-semibold">STATUS</th>
                <th className="py-2.5 px-3 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {filteredReports.map((report) => {
                const isExpanded = expandedReportId === report.id;

                return (
                  <React.Fragment key={report.id}>
                    <tr
                      className={`transition-colors hover:bg-slate-950/80 ${
                        isExpanded ? 'bg-slate-950/90' : ''
                      }`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3 px-3 font-mono font-bold text-teal-400 whitespace-nowrap">
                        {report.id}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-200">
                          {report.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <div className="flex items-center gap-1.5 text-slate-200 truncate">
                          <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                          <span className="truncate">{report.location}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 max-w-[260px]">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getPriorityBadge(report.aiAnalysis?.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(report.status, report.id)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Upvote Button */}
                          <button
                            type="button"
                            onClick={() => onUpvoteReport(report.id)}
                            title="Citizens endorsing this issue (+1 upvote)"
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-750 text-xs font-mono transition-colors cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3 text-teal-400" />
                            <span>{report.citizenUpvotes || 1}</span>
                          </button>

                          {/* Toggle Expand AI Details */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(report.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-750 transition-colors cursor-pointer"
                            title="View AI triage analysis and dispatch details"
                          >
                            <span>{isExpanded ? 'HIDE' : 'DETAILS'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-teal-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-teal-400" />
                            )}
                          </button>

                          {/* Delete Report */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete report ${report.id}?`)) {
                                onDeleteReport(report.id);
                              }
                            }}
                            title="Remove report from registry"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-950 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-950 border-y border-slate-800">
                        <td colSpan={7} className="p-4">
                          <div className="p-4 rounded border border-slate-800 bg-slate-900/90 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] font-bold text-teal-400">
                                  TICKET #{report.id} TRIAGE PROFILE
                                </span>
                                <span className="text-slate-600">·</span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(report.timestamp).toLocaleString()}
                                </span>
                              </div>

                              {report.reporterName && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  CITIZEN: {report.reporterName}
                                </span>
                              )}
                            </div>

                            {/* AI Analysis Details */}
                            {report.aiAnalysis ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                                    EXECUTIVE ASSESSMENT
                                  </span>
                                  <p className="text-slate-300 italic leading-relaxed">
                                    "{report.aiAnalysis.summary}"
                                  </p>
                                  <div className="mt-2 pt-2 border-t border-slate-850 text-[11px] text-slate-400">
                                    <strong>Priority Rationale:</strong> {report.aiAnalysis.priorityReason}
                                  </div>
                                </div>

                                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                                    DISPATCH REMEDIATION PLAN
                                  </span>
                                  <p className="text-slate-300 leading-relaxed font-sans">
                                    {report.aiAnalysis.recommendedAction}
                                  </p>
                                </div>

                                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                                    OPERATIONAL ROUTING
                                  </span>
                                  <div className="flex items-center gap-1.5 text-teal-300">
                                    <Building2 className="w-3.5 h-3.5" />
                                    <span>{report.aiAnalysis.responsibleDepartment}</span>
                                  </div>
                                  <div className="text-slate-400 pt-1 border-t border-slate-850 flex justify-between">
                                    <span>SLA TARGET:</span>
                                    <span className="text-slate-200">{report.aiAnalysis.estimatedResolutionHours || 'Standard'}</span>
                                  </div>
                                  <div className="text-slate-400 flex justify-between">
                                    <span>HAZARD INDEX:</span>
                                    <span className="text-amber-300 font-bold">{report.aiAnalysis.safetyHazardLevel || 'Moderate'}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                No automated AI triage record attached to this historical ticket.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
