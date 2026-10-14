/**
 * Location resolution and extraction utilities for CivicLens AI.
 */

/**
 * Extracts a recognizable municipal location, address, cross street, or landmark
 * from free-text complaint descriptions if not provided in the explicit input.
 */
export function extractLocationFromText(text: string | undefined | null): string | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Direct match for College bus stop landmark (case-insensitive)
  const collegeMatch = trimmed.match(/(?:at|near|by|opposite|behind|around|on|facing)?\s*(college\s+bus\s+stop)/i);
  if (collegeMatch && collegeMatch[1]) {
    return 'College bus stop';
  }

  // 2. Named bus stop / transit stop patterns (e.g. "Main St bus stop", "Market transit station")
  const transitMatch = trimmed.match(/(?:at|near|by|around|on)?\s*([A-Za-z0-9\s&'-]{2,30}?\s*(?:bus stop|transit stop|metro station|train station|subway station))/i);
  if (transitMatch && transitMatch[1]) {
    const loc = transitMatch[1].trim();
    if (loc.length >= 5) {
      return loc.replace(/^(?:at|near|by|around|on)\s+/i, '').trim();
    }
  }

  // 3. Intersections and cross streets (e.g. "Elm St & Maple Ave", "corner of 5th Ave and Oak")
  const intersectionMatch = trimmed.match(/(?:at|near|corner of|intersection of)\s+([A-Z0-9a-z\s&'-]+?(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|lane|way)\s*(?:&|and)\s*[A-Z0-9a-z\s&'-]+?(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|lane|way))/i);
  if (intersectionMatch && intersectionMatch[1]) {
    return intersectionMatch[1].replace(/^(?:at|near|corner of|intersection of)\s+/i, '').trim();
  }

  // 4. Landmarks (e.g. "behind central market", "in front of Lincoln Elementary", "at Harbor Park")
  const landmarkMatch = trimmed.match(/(?:at|near|by|behind|opposite|in front of)\s+([A-Z0-9][A-Za-z0-9\s&'-]{2,35}?(?:school|park|playground|market|library|hospital|underpass|plaza|mall|hall|center))/i);
  if (landmarkMatch && landmarkMatch[1]) {
    return landmarkMatch[1].replace(/^(?:at|near|by|behind|opposite|in front of)\s+/i, '').trim();
  }

  // 5. Street addresses (e.g. "542 5th Avenue", "120 Elm Street")
  const addressMatch = trimmed.match(/\b(\d{1,5}\s+[A-Za-z0-9\s.'-]+?(?:st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|lane|way|court))\b/i);
  if (addressMatch && addressMatch[1]) {
    return addressMatch[1].trim();
  }

  return null;
}

/**
 * Resolves the structured report location:
 * - Priority 1: Explicit user-entered location field (ALWAYS PRESERVED, NEVER OVERWRITTEN).
 * - Priority 2: AI-extracted location (only if user left the field empty).
 * - Priority 3: Pattern-based extraction from description.
 * - Priority 4: "Unspecified Municipal Location" only as a last resort when no location exists.
 */
export function resolveLocation(
  explicitLocation?: string | null,
  aiExtractedLocation?: string | null,
  description?: string | null
): string {
  // Check explicit user input first
  const cleanExplicit = (explicitLocation || '').trim();
  const isGeneric =
    !cleanExplicit ||
    cleanExplicit.toLowerCase() === 'unspecified municipal location' ||
    cleanExplicit.toLowerCase() === 'unspecified' ||
    cleanExplicit.toLowerCase() === 'unspecified location' ||
    cleanExplicit.toLowerCase() === 'general district';

  if (!isGeneric) {
    // Exact user-provided location is strictly preserved
    return cleanExplicit;
  }

  // If explicit field was empty or generic, check AI-extracted location
  const cleanAi = (aiExtractedLocation || '').trim();
  const isAiGeneric =
    !cleanAi ||
    cleanAi.toLowerCase() === 'unspecified' ||
    cleanAi.toLowerCase() === 'null' ||
    cleanAi.toLowerCase() === 'unspecified location' ||
    cleanAi.toLowerCase() === 'unspecified municipal location';

  if (!isAiGeneric) {
    return cleanAi;
  }

  // Check pattern extraction from description
  const textExtracted = extractLocationFromText(description);
  if (textExtracted) {
    return textExtracted;
  }

  return cleanExplicit || 'Unspecified Municipal Location';
}
