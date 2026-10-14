import { CivicReport, IssueCategory } from '../types';
import { isSameCategory } from './categories';

export interface DuplicateDetectionMatch {
  isDuplicate: boolean;
  matchingReport?: CivicReport;
  similarityScore: number;
  matchReasons: string[];
}

function cleanTokens(str: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'at', 'near', 'in', 'on', 'of', 'to', 'for',
    'is', 'are', 'was', 'were', 'it', 'its', 'this', 'that', 'with', 'by', 'from'
  ]);

  return new Set(
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }
  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? (intersectionCount / unionSize) * 100 : 0;
}

function normalizeLocation(loc: string): string {
  return loc
    .toLowerCase()
    .replace(/^(?:at|near|by|around|on|corner of|intersection of)\s+/i, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether an incoming complaint is an exact or high-confidence duplicate
 * of an existing report in the registry.
 * 
 * Rules:
 * - Categories must match conceptually (isSameCategory).
 * - Locations must share physical overlap.
 * - Descriptions must exhibit high semantic or keyword overlap.
 * - Legitimate different issues at the same location (e.g., streetlight vs pothole) are KEPT SEPARATE.
 */
export function findExactOrHighDuplicate(
  complaint: {
    category: IssueCategory;
    location: string;
    description: string;
  },
  existingReports: CivicReport[]
): DuplicateDetectionMatch {
  if (!complaint || !complaint.description || existingReports.length === 0) {
    return { isDuplicate: false, similarityScore: 0, matchReasons: [] };
  }

  const incomingLocNorm = normalizeLocation(complaint.location);
  const incomingDescTokens = cleanTokens(complaint.description);
  const incomingFullTokens = cleanTokens(`${complaint.location} ${complaint.description}`);

  let bestMatch: CivicReport | undefined;
  let highestScore = 0;
  let bestReasons: string[] = [];

  for (const report of existingReports) {
    // 1. Category check: different issue categories at the same location are NOT duplicates
    if (!isSameCategory(complaint.category, report.category)) {
      continue;
    }

    // 2. Location comparison
    const existingLocNorm = normalizeLocation(report.location);
    const exactLocMatch =
      incomingLocNorm.length > 3 &&
      existingLocNorm.length > 3 &&
      (incomingLocNorm.includes(existingLocNorm) || existingLocNorm.includes(incomingLocNorm));

    const locTokensA = cleanTokens(complaint.location);
    const locTokensB = cleanTokens(report.location);
    const locSimilarity = calculateJaccardSimilarity(locTokensA, locTokensB);

    const isLocationShared = exactLocMatch || locSimilarity >= 50;
    if (!isLocationShared) {
      continue;
    }

    // 3. Description comparison
    const existingDescTokens = cleanTokens(report.description);
    const descSimilarity = calculateJaccardSimilarity(incomingDescTokens, existingDescTokens);

    // 4. Combined full text similarity
    const existingFullTokens = cleanTokens(`${report.location} ${report.description}`);
    const fullSimilarity = calculateJaccardSimilarity(incomingFullTokens, existingFullTokens);

    // Exact string match check (ignoring punctuation/whitespace)
    const rawDescA = complaint.description.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rawDescB = report.description.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isIdenticalText = rawDescA.length > 15 && rawDescA === rawDescB;
    const isNearExactText =
      rawDescA.length > 15 && (rawDescA.includes(rawDescB) || rawDescB.includes(rawDescA));

    let score = Math.round(Math.max(descSimilarity, fullSimilarity));
    if (isIdenticalText && (exactLocMatch || incomingLocNorm === existingLocNorm)) {
      score = 100;
    } else if (isIdenticalText || isNearExactText) {
      score = Math.max(score, 98);
    } else if (exactLocMatch && descSimilarity >= 50) {
      score = Math.min(100, Math.round(descSimilarity * 0.6 + 40));
    }

    if (score >= 65 && score > highestScore) {
      highestScore = score;
      bestMatch = report;
      const reasons: string[] = [];
      if (exactLocMatch || incomingLocNorm === existingLocNorm) {
        reasons.push(`Identical location: "${report.location}"`);
      } else {
        reasons.push(`Matching vicinity (${Math.round(locSimilarity)}% location overlap)`);
      }
      reasons.push(`Same issue category (${report.category})`);
      if (isIdenticalText) {
        reasons.push('Identical complaint description (100% verbatim match)');
      } else if (isNearExactText) {
        reasons.push('Identical or near-verbatim issue description');
      } else {
        reasons.push(`${Math.round(descSimilarity)}% description vocabulary match`);
      }
      bestReasons = reasons;
    }
  }

  if (bestMatch && (highestScore >= 75 || highestScore === 100)) {
    return {
      isDuplicate: true,
      matchingReport: bestMatch,
      similarityScore: highestScore,
      matchReasons: bestReasons,
    };
  }

  return {
    isDuplicate: false,
    similarityScore: highestScore,
    matchReasons: bestReasons,
  };
}
