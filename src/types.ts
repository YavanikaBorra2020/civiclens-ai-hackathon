export type IssueCategory =
  | 'Potholes'
  | 'Garbage'
  | 'Water Leakage'
  | 'Broken Streetlights'
  | 'Streetlights'
  | 'Drainage'
  | 'Other';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus = 'Submitted' | 'In Triage' | 'Dispatched' | 'In Progress' | 'Resolved';

export interface AIAnalysisResult {
  summary: string;
  priority: PriorityLevel;
  priorityReason: string;
  recommendedAction: string;
  responsibleDepartment: string;
  safetyHazardLevel?: 'None' | 'Low' | 'Moderate' | 'Severe';
  estimatedResolutionHours?: string;
  suggestedTags?: string[];
  extractedLocation?: string;
}

export interface CivicReport {
  id: string;
  category: IssueCategory;
  location: string;
  description: string;
  reporterName?: string;
  timestamp: string; // ISO string
  status: ReportStatus;
  aiAnalysis?: AIAnalysisResult;
  citizenUpvotes?: number;
  linkedTicketIds?: string[];
}

export interface DuplicateRadarMatch {
  reportId: string;
  similarityScore: number;
  matchConfidence: 'High' | 'Medium' | 'Low';
  matchReasons: string[];
  verdict: string;
}

export interface DuplicateRadarResult {
  hasProbableDuplicate: boolean;
  radarAnalysisSummary: string;
  matches: DuplicateRadarMatch[];
}
