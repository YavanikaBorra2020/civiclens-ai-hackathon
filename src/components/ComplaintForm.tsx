import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Tag,
  AlertCircle,
  RotateCcw,
  Radio,
  FileQuestion,
  User,
  Zap,
} from 'lucide-react';
import { IssueCategory } from '../types';
import { SAMPLE_COMPLAINTS, SampleComplaint } from '../data/seedData';
import { resolveLocation } from '../utils/location';

interface ComplaintFormProps {
  onAnalyze: (data: {
    category: IssueCategory;
    location: string;
    description: string;
    reporterName?: string;
  }) => void;
  onCheckDuplicates: (data: {
    category: IssueCategory;
    location: string;
    description: string;
  }) => void;
  isAnalyzing: boolean;
  isCheckingDuplicates: boolean;
  serverError: string | null;
  onClearError: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onAnalyze,
  onCheckDuplicates,
  isAnalyzing,
  isCheckingDuplicates,
  serverError,
  onClearError,
}) => {
  const [category, setCategory] = useState<IssueCategory>('Potholes');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  const categories: { key: IssueCategory; label: string; icon: string }[] = [
    { key: 'Potholes', label: 'Potholes / Road Damage', icon: '🕳️' },
    { key: 'Garbage', label: 'Garbage & Waste Overspill', icon: '🗑️' },
    { key: 'Water Leakage', label: 'Water Leakage / Pipe Burst', icon: '💧' },
    { key: 'Streetlights', label: 'Streetlights', icon: '💡' },
    { key: 'Broken Streetlights', label: 'Broken Streetlights', icon: '💡' },
    { key: 'Drainage', label: 'Drainage & Flooding Hazards', icon: '🌊' },
    { key: 'Other', label: 'Other Municipal Infrastructure', icon: '🏗️' },
  ];

  const handleLoadSample = (sample: SampleComplaint) => {
    setCategory(sample.category);
    setLocation(sample.location);
    setDescription(sample.description);
    setFormValidationError(null);
    onClearError();
  };

  const handleClear = () => {
    setCategory('Potholes');
    setLocation('');
    setDescription('');
    setReporterName('');
    setFormValidationError(null);
    onClearError();
  };

  const handleSubmitAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !category.trim()) {
      setFormValidationError('Please select a valid issue category.');
      return;
    }
    if (!description.trim()) {
      setFormValidationError('Please provide a description of the civic problem.');
      return;
    }
    if (description.trim().length < 10) {
      setFormValidationError('Please provide more context (at least 10 characters).');
      return;
    }
    setFormValidationError(null);
    onClearError();

    // Preserve exact explicit location or extract from description if empty
    const resolvedLoc = resolveLocation(location, null, description);

    onAnalyze({
      category,
      location: resolvedLoc,
      description: description.trim(),
      reporterName: reporterName.trim() || undefined,
    });
  };

  const handleTriggerRadar = () => {
    if (!description.trim()) {
      setFormValidationError('Enter a complaint description before scanning for duplicates.');
      return;
    }
    setFormValidationError(null);
    onClearError();

    const resolvedLoc = resolveLocation(location, null, description);

    onCheckDuplicates({
      category,
      location: resolvedLoc,
      description: description.trim(),
    });
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-lg p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              CITIZEN INCIDENT INTAKE CONSOLE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit municipal reports for real-time AI triage assessment, severity ranking, and duplicate detection.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded transition-colors self-start sm:self-auto cursor-pointer"
          title="Clear form inputs"
        >
          <RotateCcw className="w-3 h-3" />
          <span>CLEAR FORM</span>
        </button>
      </div>

      {/* 1-Click Demo Samples Strip */}
      <div className="mb-4 p-3 rounded bg-slate-950 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            OPERATIONAL DEMO SCENARIOS
          </span>
          <span className="text-[10px] font-mono text-slate-400">1-click prefill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_COMPLAINTS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="text-left p-2.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors truncate">
                  {sample.title}
                </span>
                <span className="text-[9px] font-mono uppercase font-bold px-1 py-0.2 rounded bg-slate-950 text-teal-400 border border-slate-800 shrink-0">
                  #{idx + 1}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-teal-400 truncate">
                <span>LOC: {sample.location.split('(')[0].trim()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Validation or Server Error */}
      {(formValidationError || serverError) && (
        <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold uppercase tracking-wider text-[11px]">FORM SUBMISSION ALERT:</p>
            <p className="text-rose-300 mt-0.5 font-sans">{formValidationError || serverError}</p>
          </div>
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={handleSubmitAnalyze} className="space-y-3.5">
        {/* Category & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-400" />
              <span>Issue Category *</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all appearance-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key} className="bg-slate-900 text-slate-100">
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Location / Address / Landmark *</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. College bus stop, or Elm St & Maple Ave"
              aria-label="Location / Address / Landmark"
              className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-teal-400" />
              <span>Complaint Description *</span>
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {description.length} chars (min 10)
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the condition, size, safety hazard, affected pedestrians or vehicles, and how long it has persisted..."
            className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all resize-y"
          />
        </div>

        {/* Reporter Name Field (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-400" />
            <span>Citizen Name / Contact (Optional)</span>
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="e.g. Jane Doe, Resident District 4 (or leave blank for Anonymous)"
            className="w-full bg-slate-950 border border-slate-750 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Duplicate Radar Scanner button */}
          <button
            type="button"
            onClick={handleTriggerRadar}
            disabled={isCheckingDuplicates || isAnalyzing}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded border border-slate-700 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-teal-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isCheckingDuplicates ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-teal-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>SCANNING RADAR...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                <span>CHECK FOR EXISTING DUPLICATES</span>
              </>
            )}
          </button>

          {/* Primary Submit Analyze button */}
          <button
            type="submit"
            disabled={isAnalyzing || isCheckingDuplicates}
            className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>ANALYZING COMPLAINT WITH GEMINI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>ANALYZE COMPLAINT & ASSIGN PRIORITY</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
