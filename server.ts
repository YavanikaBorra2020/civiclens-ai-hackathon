import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize the Gemini client securely on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Helper to handle transient upstream model demand spikes with graceful backoff
async function generateWithRetry(params: any, retries = 2, delayMs = 1200): Promise<any> {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || '');
      const isTransient =
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('429');
      if (isTransient && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

// Endpoint 1: Analyze Complaint with Gemini AI
app.post('/api/analyze-complaint', async (req, res) => {
  try {
    const { category, location, description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Complaint description is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please attach an API key in AI Studio Secrets.',
      });
    }

    const prompt = `You are CivicLens AI, an expert municipal operations analyst and civic triage coordinator.
Analyze the following citizen municipal complaint:
- Category: ${category || 'Unspecified'}
- Location: ${location || 'Unspecified location'}
- Citizen Description: "${description}"

Perform an objective municipal assessment. Determine:
1. summary: A crisp 1-2 sentence executive summary of the problem and its direct civic impact.
2. priority: One of "Low", "Medium", "High", or "Critical".
   - Critical: Imminent danger to human life, active flash flooding, high-voltage live wires, gas leaks, structural bridge/road collapse.
   - High: Active traffic accidents risk, deep crater pothole on arterial road, burst water main causing water outage, toxic/hazardous waste accumulation.
   - Medium: Routine residential potholes, non-hazardous litter, non-functioning decorative streetlight, minor storm drain blockage.
   - Low: Cosmetic civic issues, faded curb paint, minor graffiti, non-urgent general maintenance.
3. priorityReason: Clear, factual rationale justifying the selected priority based on public safety, accessibility, economic cost of delay, or environmental hazard.
4. recommendedAction: Step-by-step immediate and secondary operational remediation for dispatch teams.
5. responsibleDepartment: The exact municipal department/agency in charge (e.g., "Department of Transportation & Pavement Management", "Bureau of Sanitation & Waste Solutions", "Municipal Water & Sewer Authority", "Department of Public Lighting & Grid", "Stormwater & Flood Control Agency").
6. safetyHazardLevel: "None", "Low", "Moderate", or "Severe".
7. estimatedResolutionHours: Standard service level agreement target (e.g., "Under 4 Hours (Emergency Dispatch)", "24-48 Hours (Expedited Crew)", "3-5 Business Days (Standard Schedule)", "Routine Cycle (1-2 Weeks)").
8. suggestedTags: Array of 2 to 4 concise keywords.
9. extractedLocation: If an explicit location was provided ("${location || ''}"), preserve that location. If not provided or generic, extract the specific landmark, bus stop, or street mentioned in the citizen description (e.g. 'College bus stop').`;

    const response = await generateWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            priority: {
              type: Type.STRING,
              enum: ['Low', 'Medium', 'High', 'Critical'],
            },
            priorityReason: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            responsibleDepartment: { type: Type.STRING },
            safetyHazardLevel: {
              type: Type.STRING,
              enum: ['None', 'Low', 'Moderate', 'Severe'],
            },
            estimatedResolutionHours: { type: Type.STRING },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            extractedLocation: {
              type: Type.STRING,
              description: 'The physical location or landmark (e.g. College bus stop).',
            },
          },
          required: [
            'summary',
            'priority',
            'priorityReason',
            'recommendedAction',
            'responsibleDepartment',
            'safetyHazardLevel',
            'estimatedResolutionHours',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsed = JSON.parse(rawText.trim());
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing complaint:', err);
    let friendlyMessage = err?.message || 'Failed to analyze complaint via Gemini AI.';
    try {
      // Clean up nested JSON error string if present
      if (typeof friendlyMessage === 'string' && friendlyMessage.includes('{"error":')) {
        const parsedErr = JSON.parse(friendlyMessage.replace(/^[^{]*/, ''));
        if (parsedErr?.error?.message) {
          friendlyMessage = parsedErr.error.message;
        }
      }
    } catch {
      // Keep original message if parsing fails
    }
    return res.status(500).json({ error: friendlyMessage });
  }
});

// Endpoint 2: Smart Duplicate Radar
app.post('/api/check-duplicates', async (req, res) => {
  try {
    const { currentComplaint, existingReports } = req.body;

    if (!currentComplaint || !currentComplaint.description) {
      return res.status(400).json({ error: 'Current complaint details are required.' });
    }

    if (!Array.isArray(existingReports) || existingReports.length === 0) {
      return res.json({
        hasProbableDuplicate: false,
        radarAnalysisSummary: 'No existing historical tickets found in database to compare against.',
        matches: [],
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const candidateSubset = existingReports.slice(0, 40).map((r) => ({
      id: r.id,
      category: r.category,
      location: r.location,
      description: r.description,
      status: r.status,
      timestamp: r.timestamp,
    }));

    const prompt = `You are the CivicLens AI Smart Duplicate Radar.
Evaluate if the following incoming municipal report duplicates or is strongly related to any of the existing open/pending municipal reports.

INCOMING REPORT:
- Category: ${currentComplaint.category || 'Unknown'}
- Location: ${currentComplaint.location || 'Unknown'}
- Description: "${currentComplaint.description}"

EXISTING MUNICIPAL REPORTS DATABASE:
${JSON.stringify(candidateSubset, null, 2)}

TASK:
1. Compare physical proximity / street mentions, category type, and specific infrastructure problem description.
2. Only consider reports in the provided database. NEVER invent or hallucinate new report IDs.
3. Identify any reports that share >40% likelihood of referring to the exact same incident or same localized hazard.
4. If different problems occur at the same location (e.g. broken streetlight vs pothole), do NOT mark them as duplicate. Keep different issues separate.
5. For each candidate match, assign:
   - reportId: Must be an EXACT ID from the existing reports database above. Do not list the same reportId more than once.
   - similarityScore: 0 to 100 percentage.
   - matchConfidence: "High" (80-100%), "Medium" (50-79%), or "Low" (30-49%).
   - matchReasons: array of 2-3 specific reasons (e.g. "Identical location mentioned: College Main Gate", "Same issue category: Potholes", "Identical hazard description").
   - verdict: Short recommendation for dispatchers (e.g., "Merge with Ticket #CIV-2026-108: duplicate citizen report of the same pothole near College Main Gate").
6. If no report matches above 35%, return empty matches array.`;

    const response = await generateWithRetry({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasProbableDuplicate: { type: Type.BOOLEAN },
            radarAnalysisSummary: { type: Type.STRING },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  reportId: { type: Type.STRING },
                  similarityScore: { type: Type.INTEGER },
                  matchConfidence: {
                    type: Type.STRING,
                    enum: ['High', 'Medium', 'Low'],
                  },
                  matchReasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  verdict: { type: Type.STRING },
                },
                required: ['reportId', 'similarityScore', 'matchConfidence', 'matchReasons', 'verdict'],
              },
            },
          },
          required: ['hasProbableDuplicate', 'radarAnalysisSummary', 'matches'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response received from Gemini Duplicate Radar.');
    }

    const parsed = JSON.parse(rawText.trim());

    // Strict validation: enforce that every reported match exists in the real registry
    // and deduplicate so the same existing report is NEVER displayed more than once
    const validReportIdMap = new Map(existingReports.map((r: any) => [r.id, r]));
    const seenMatchIds = new Set<string>();
    const sanitizedMatches: any[] = [];

    // First check for deterministic verbatim/identical matches in registry to guarantee 100% precision
    const incomingRaw = (currentComplaint.description || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const incomingLocNorm = (currentComplaint.location || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const report of existingReports) {
      const repRaw = (report.description || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const repLocNorm = (report.location || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const isCategoryMatch = (report.category || '').toLowerCase().includes((currentComplaint.category || '').toLowerCase().substring(0, 4));

      if (isCategoryMatch && incomingRaw.length > 15 && incomingRaw === repRaw) {
        seenMatchIds.add(report.id);
        sanitizedMatches.push({
          reportId: report.id,
          similarityScore: 100,
          matchConfidence: 'High',
          matchReasons: [
            `Identical location mentioned: ${report.location}`,
            `Same issue category: ${report.category}`,
            'Identical verbatim complaint description (100% match)',
          ],
          verdict: `Exact duplicate of Ticket #${report.id}. Recommend linking citizen upvote instead of dispatching new ticket.`,
        });
      }
    }

    for (const match of parsed.matches || []) {
      if (!match || !match.reportId) continue;
      const cleanId = String(match.reportId).trim();
      if (!validReportIdMap.has(cleanId)) continue; // Never invent IDs
      if (seenMatchIds.has(cleanId)) continue; // Never duplicate entries

      seenMatchIds.add(cleanId);
      sanitizedMatches.push({
        ...match,
        reportId: cleanId,
        similarityScore: Math.min(100, Math.max(0, Number(match.similarityScore) || 0)),
      });
    }

    // Sort highest similarity score first
    sanitizedMatches.sort((a, b) => b.similarityScore - a.similarityScore);

    return res.json({
      hasProbableDuplicate: sanitizedMatches.length > 0 && (sanitizedMatches[0].similarityScore >= 60 || parsed.hasProbableDuplicate),
      radarAnalysisSummary: parsed.radarAnalysisSummary || (sanitizedMatches.length > 0 ? `Identified ${sanitizedMatches.length} matching incident(s).` : 'No matching duplicates found in registry.'),
      matches: sanitizedMatches,
    });
  } catch (err: any) {
    console.error('Error in duplicate radar:', err);
    let friendlyMessage = err?.message || 'Failed to scan for duplicate reports via Gemini AI.';
    try {
      if (typeof friendlyMessage === 'string' && friendlyMessage.includes('{"error":')) {
        const parsedErr = JSON.parse(friendlyMessage.replace(/^[^{]*/, ''));
        if (parsedErr?.error?.message) {
          friendlyMessage = parsedErr.error.message;
        }
      }
    } catch {
      // Keep original
    }
    return res.status(500).json({ error: friendlyMessage });
  }
});

// Setup Vite or static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicLens AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
