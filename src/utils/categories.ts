import { IssueCategory } from '../types';

export interface CategoryOption {
  key: IssueCategory;
  label: string;
  icon: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'Potholes', label: 'Potholes / Road Damage', icon: '🕳️' },
  { key: 'Garbage', label: 'Garbage & Waste Overspill', icon: '🗑️' },
  { key: 'Water Leakage', label: 'Water Leakage / Pipe Burst', icon: '💧' },
  { key: 'Streetlights', label: 'Streetlights', icon: '💡' },
  { key: 'Broken Streetlights', label: 'Broken Streetlights / Electrical', icon: '💡' },
  { key: 'Drainage', label: 'Drainage & Flooding Hazards', icon: '🌊' },
  { key: 'Other', label: 'Other Municipal Infrastructure', icon: '🏗️' },
];

/**
 * Checks if two categories represent the same conceptual civic category,
 * ensuring seamless equivalence between 'Streetlights' and 'Broken Streetlights'
 * for filtering and dashboard metric breakdowns without altering the stored report category.
 */
export function isSameCategory(
  catA: string | undefined | null,
  catB: string | undefined | null
): boolean {
  if (!catA || !catB) return false;
  if (catA === catB) return true;

  const a = catA.trim().toLowerCase();
  const b = catB.trim().toLowerCase();

  if (a === b) return true;

  const isStreetlightA =
    a === 'streetlights' ||
    a === 'broken streetlights' ||
    a === 'streetlight' ||
    a === 'broken streetlight';

  const isStreetlightB =
    b === 'streetlights' ||
    b === 'broken streetlights' ||
    b === 'streetlight' ||
    b === 'broken streetlight';

  if (isStreetlightA && isStreetlightB) {
    return true;
  }

  return false;
}
