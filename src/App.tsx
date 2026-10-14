import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DashboardStats } from './components/DashboardStats';
import { ComplaintForm } from './components/ComplaintForm';
import { AIAnalysisCard } from './components/AIAnalysisCard';
import { DuplicateRadarModal } from './components/DuplicateRadarModal';
import { DuplicateInterceptionModal } from './components/DuplicateInterceptionModal';
import { ReportsTable } from './components/ReportsTable';
import {
  CivicReport,
  IssueCategory,
  PriorityLevel,
  ReportStatus,
  AIAnalysisResult,
  DuplicateRadarResult,
} from './types';
import {
  loadReportsFromStorage,
  saveReportsToStorage,
  resetReportsToSeed,
} from './utils/storage';
import { exportReportsToCSV } from './utils/csv';
import { resolveLocation } from './utils/location';
import { findExactOrHighDuplicate } from './utils/duplicateDetection';
import { CheckCircle2, AlertCircle, Radio } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'ALL'>('ALL');

  // Active form state / Pending analysis
  const [pendingComplaint, setPendingComplaint] = useState<{
    category: IssueCategory;
    location: string;
    description: string;
    reporterName?: string;
  } | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Duplicate Radar state
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [radarResult, setRadarResult] = useState<DuplicateRadarResult | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [radarError, setRadarError] = useState<string | null>(null);

  // Pre-save Duplicate Interception Modal state
  const [duplicateInterception, setDuplicateInterception] = useState<{
    matchingReport: CivicReport;
    similarityScore: number;
    matchReasons: string[];
    newComplaint: {
      category: IssueCategory;
      location: string;
      description: string;
      reporterName?: string;
    };
  } | null>(null);

  // Saving state guard to block duplicate clicks and rapid double submissions
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = React.useRef(false);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const loaded = loadReportsFromStorage();
    setReports(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Analyze Complaint via server-side Gemini AI
  const handleAnalyzeComplaint = async (data: {
    category: IssueCategory;
    location: string;
    description: string;
    reporterName?: string;
  }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    // Resolve location: explicit input takes priority, with description fallback
    const resolvedLoc = resolveLocation(data.location, null, data.description);
    const complaintData = {
      ...data,
      location: resolvedLoc,
    };
    setPendingComplaint(complaintData);

    try {
      const response = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: complaintData.category,
          location: complaintData.location,
          description: complaintData.description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server responded with status ${response.status}`);
      }

      setAiAnalysis(result);
    } catch (err: any) {
      console.error('Error in handleAnalyzeComplaint:', err);
      setAnalysisError(
        err.message || 'AI analysis failed. Please verify server connection and try again.'
      );
      setAiAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Check Duplicate Radar via server-side Gemini AI
  const handleCheckDuplicates = async (data: {
    category: IssueCategory;
    location: string;
    description: string;
  }) => {
    setIsCheckingDuplicates(true);
    setRadarError(null);
    setIsRadarModalOpen(true);

    try {
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentComplaint: data,
          existingReports: reports,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Radar check failed with status ${response.status}`);
      }

      setRadarResult(result);
    } catch (err: any) {
      console.error('Error in handleCheckDuplicates:', err);
      setRadarError(err.message || 'Failed to complete radar scan.');
      setRadarResult(null);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Save the analyzed report to local storage (with pre-save duplicate interception check)
  const handleSaveReport = (forceOverride = false) => {
    if (!pendingComplaint || !aiAnalysis) return;

    // Prevent duplicate clicks or rapid concurrent submissions
    if (isSavingRef.current) {
      console.warn('Submission already in progress; ignoring duplicate click.');
      return;
    }

    // Validate that category is strictly preserved from the user-selected complaint
    const selectedCategoryValue = pendingComplaint.category;
    if (!selectedCategoryValue) {
      showToast('Error: Category is missing from complaint. Please re-select a category.');
      return;
    }

    // Resolve final location: explicit user input takes absolute priority
    const finalLocation = resolveLocation(
      pendingComplaint.location,
      aiAnalysis.extractedLocation,
      pendingComplaint.description
    );

    // Always fetch the freshest persistent records from localStorage
    const currentStoredReports = loadReportsFromStorage();
    const currentRegistry = currentStoredReports.length >= reports.length ? currentStoredReports : reports;

    // Pre-save duplicate check: prevent accidental duplicates like CIV-2026-108 vs CIV-2026-109
    if (!forceOverride) {
      const duplicateCheck = findExactOrHighDuplicate(
        {
          category: selectedCategoryValue,
          location: finalLocation,
          description: pendingComplaint.description,
        },
        currentRegistry
      );

      if (duplicateCheck.isDuplicate && duplicateCheck.matchingReport) {
        setDuplicateInterception({
          matchingReport: duplicateCheck.matchingReport,
          similarityScore: duplicateCheck.similarityScore,
          matchReasons: duplicateCheck.matchReasons,
          newComplaint: {
            category: selectedCategoryValue,
            location: finalLocation,
            description: pendingComplaint.description,
            reporterName: pendingComplaint.reporterName,
          },
        });
        return;
      }
    }

    // Lock submission to block rapid/duplicate clicks
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      // Calculate next monotonic ID safely from existing IDs to prevent collisions
      const maxNum = currentRegistry.reduce((max, r) => {
        const match = r.id.match(/CIV-2026-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 100);
      const newId = `CIV-2026-${String(maxNum + 1).padStart(3, '0')}`;

      const newReport: CivicReport = {
        id: newId,
        category: selectedCategoryValue, // Strictly preserves the exact user-selected category
        location: finalLocation, // Preserves exact user location or extracted landmark
        description: pendingComplaint.description,
        reporterName: pendingComplaint.reporterName || 'Anonymous Citizen',
        timestamp: new Date().toISOString(),
        status: 'Submitted',
        aiAnalysis: aiAnalysis,
        citizenUpvotes: 1,
      };

      const updated = [newReport, ...currentRegistry];
      setReports(updated);
      saveReportsToStorage(updated);

      // Reset pending state
      setAiAnalysis(null);
      setPendingComplaint(null);
      setDuplicateInterception(null);
      showToast(`Report filed successfully! Ticket #${newId} recorded under category "${selectedCategoryValue}".`);
    } finally {
      // Release lock after safety window
      setTimeout(() => {
        isSavingRef.current = false;
        setIsSaving(false);
      }, 500);
    }
  };

  // Link to existing report from duplicate radar or interception modal
  const handleLinkToExisting = (existingReportId: string) => {
    const currentStoredReports = loadReportsFromStorage();
    const currentRegistry = currentStoredReports.length >= reports.length ? currentStoredReports : reports;
    const updated = currentRegistry.map((r) => {
      if (r.id === existingReportId) {
        return {
          ...r,
          citizenUpvotes: (r.citizenUpvotes || 1) + 1,
        };
      }
      return r;
    });

    setReports(updated);
    saveReportsToStorage(updated);
    setIsRadarModalOpen(false);
    setDuplicateInterception(null);
    setAiAnalysis(null);
    setPendingComplaint(null);
    showToast(`Linked to Ticket #${existingReportId}! Upvote recorded; duplicate ticket creation prevented.`);
  };

  // Upvote report from table
  const handleUpvoteReport = (id: string) => {
    const updated = reports.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          citizenUpvotes: (r.citizenUpvotes || 1) + 1,
        };
      }
      return r;
    });

    setReports(updated);
    saveReportsToStorage(updated);
    showToast(`Citizen endorsement logged for Ticket #${id} (+1 upvote).`);
  };

  // Delete a report
  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveReportsToStorage(updated);
    showToast(`Ticket #${id} removed from municipal registry.`);
  };

  // Inline Status Update
  const handleUpdateStatus = (id: string, newStatus: ReportStatus) => {
    const updated = reports.map((r) => {
      if (r.id === id) {
        return { ...r, status: newStatus };
      }
      return r;
    });

    setReports(updated);
    saveReportsToStorage(updated);
    showToast(`Ticket #${id} status updated to "${newStatus}".`);
  };

  // Reset demo data
  const handleResetData = () => {
    if (confirm('Reset municipal database to initial demo state? Any custom filings will be replaced with standard seed data.')) {
      const seeded = resetReportsToSeed();
      setReports(seeded);
      setSelectedCategory('ALL');
      setSelectedPriority('ALL');
      setAiAnalysis(null);
      setPendingComplaint(null);
      setDuplicateInterception(null);
      showToast('Municipal database reset to initial demonstration records.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    exportReportsToCSV(reports);
    showToast(`Exported ${reports.length} municipal tickets to CSV.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 bg-control-grid">
      {/* Top Advisory Notice */}
      <DisclaimerBanner />

      {/* Main Operations Header */}
      <Navbar
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        reportsCount={reports.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded bg-slate-900 border border-teal-500/80 text-teal-300 text-xs flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs ml-3 cursor-pointer"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* Dashboard Metrics & Category Bar */}
        <DashboardStats
          reports={reports}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
        />

        {/* Complaint Submission & AI Analysis Section */}
        <section className="mb-6">
          <ComplaintForm
            onAnalyze={handleAnalyzeComplaint}
            onCheckDuplicates={handleCheckDuplicates}
            isAnalyzing={isAnalyzing}
            isCheckingDuplicates={isCheckingDuplicates}
            serverError={analysisError}
            onClearError={() => setAnalysisError(null)}
          />

          {/* AI Analysis Result Card */}
          {aiAnalysis && (
            <AIAnalysisCard
              analysis={aiAnalysis}
              category={pendingComplaint?.category}
              location={resolveLocation(
                pendingComplaint?.location,
                aiAnalysis?.extractedLocation,
                pendingComplaint?.description
              )}
              onSaveReport={() => handleSaveReport(false)}
              onScanDuplicates={() => {
                if (pendingComplaint) {
                  handleCheckDuplicates({
                    category: pendingComplaint.category,
                    location: pendingComplaint.location,
                    description: pendingComplaint.description,
                  });
                }
              }}
              onDismiss={() => {
                setAiAnalysis(null);
                setPendingComplaint(null);
              }}
              isSaving={isSaving}
            />
          )}
        </section>

        {/* Reports Table & Filtered Registry */}
        <ReportsTable
          reports={reports}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          onUpvoteReport={handleUpvoteReport}
          onDeleteReport={handleDeleteReport}
          onUpdateStatus={handleUpdateStatus}
          onExportCSV={handleExportCSV}
        />
      </main>

      {/* Duplicate Radar Modal */}
      <DuplicateRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        radarResult={radarResult}
        isLoading={isCheckingDuplicates}
        error={radarError}
        existingReports={reports}
        onLinkToExisting={handleLinkToExisting}
        onProceedAsNew={() => {
          setIsRadarModalOpen(false);
          showToast('Proceeding to file as a distinct new report.');
        }}
      />

      {/* Pre-Save Duplicate Interception Modal */}
      {duplicateInterception && (
        <DuplicateInterceptionModal
          isOpen={Boolean(duplicateInterception)}
          onClose={() => setDuplicateInterception(null)}
          matchingReport={duplicateInterception.matchingReport}
          similarityScore={duplicateInterception.similarityScore}
          matchReasons={duplicateInterception.matchReasons}
          newComplaint={duplicateInterception.newComplaint}
          onLinkToExisting={handleLinkToExisting}
          onConfirmFileAnyway={() => handleSaveReport(true)}
          isSaving={isSaving}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CIVICLENS AI — MUNICIPAL INCIDENT TRIAGE ENGINE</span>
          <span className="text-[11px] text-slate-400">
            Google Gemini 3.1 Flash • Prototype Operations Mode
          </span>
        </div>
      </footer>
    </div>
  );
}
