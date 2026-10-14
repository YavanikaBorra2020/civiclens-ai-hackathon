import { CivicReport, IssueCategory } from '../types';
import { INITIAL_CIVIC_REPORTS } from '../data/seedData';
import { resolveLocation } from './location';

const STORAGE_KEY = 'civiclens_reports_v1';

export function loadReportsFromStorage(): CivicReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveReportsToStorage(INITIAL_CIVIC_REPORTS);
      return INITIAL_CIVIC_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let wasModified = false;

      // Preserve all existing reports and ensure baseline reports (including CIV-2026-108 and CIV-2026-109) are present
      const existingIdSet = new Set(parsed.map((item: any) => item && item.id));
      const missingBaseline = INITIAL_CIVIC_REPORTS.filter((item) => !existingIdSet.has(item.id));
      
      let sourceList: CivicReport[] = parsed;
      if (missingBaseline.length > 0) {
        sourceList = [...parsed, ...missingBaseline];
        wasModified = true;
      }

      const healedReports: CivicReport[] = sourceList.map((item: CivicReport) => {
        let r = { ...item };
        const descLower = (r.description || '').toLowerCase();

        // 1. Specific fix for CIV-2026-107 or streetlight complaints saved as Potholes
        const isStreetlightContent =
          descLower.includes('streetlight') ||
          descLower.includes('street light') ||
          descLower.includes('luminaire') ||
          descLower.includes('lamp post') ||
          r.aiAnalysis?.responsibleDepartment?.toLowerCase().includes('lighting');

        if (
          r.id === 'CIV-2026-107' &&
          (r.category === 'Potholes' || !r.category) &&
          isStreetlightContent
        ) {
          wasModified = true;
          r.category = 'Streetlights' as IssueCategory;
        }

        if (!r.category) {
          wasModified = true;
          r.category = (isStreetlightContent ? 'Streetlights' : 'Other') as IssueCategory;
        }

        // 2. Location consistency & extraction healing:
        // If report has "Unspecified Municipal Location" but description contains a valid location like "College bus stop"
        const explicitLoc = (r.location || '').trim();
        const isUnspecified =
          !explicitLoc ||
          explicitLoc.toLowerCase() === 'unspecified municipal location' ||
          explicitLoc.toLowerCase() === 'unspecified' ||
          explicitLoc.toLowerCase() === 'general district';

        if (isUnspecified) {
          const healedLocation = resolveLocation(
            null,
            r.aiAnalysis?.extractedLocation,
            r.description
          );
          if (healedLocation && healedLocation !== 'Unspecified Municipal Location') {
            wasModified = true;
            r.location = healedLocation;
          }
        }

        return r;
      });

      if (wasModified) {
        saveReportsToStorage(healedReports);
      }

      return healedReports;
    }
    saveReportsToStorage(INITIAL_CIVIC_REPORTS);
    return INITIAL_CIVIC_REPORTS;
  } catch (err) {
    console.error('Failed to parse reports from localStorage:', err);
    return INITIAL_CIVIC_REPORTS;
  }
}

export function saveReportsToStorage(reports: CivicReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage:', err);
  }
}

export function resetReportsToSeed(): CivicReport[] {
  saveReportsToStorage(INITIAL_CIVIC_REPORTS);
  return INITIAL_CIVIC_REPORTS;
}
