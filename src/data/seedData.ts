import { CivicReport, IssueCategory } from '../types';

export interface SampleComplaint {
  title: string;
  badge: string;
  category: IssueCategory;
  location: string;
  description: string;
}

export const SAMPLE_COMPLAINTS: SampleComplaint[] = [
  {
    title: 'School Zone Pothole Hazard',
    badge: 'High Traffic Hazard',
    category: 'Potholes',
    location: 'Elm St & Maple Ave (Southbound, opposite Lincoln Elementary)',
    description:
      'Deep 8-inch crater pothole located directly in front of the Lincoln Elementary school crosswalk. Multiple morning parents have had tires punctured, and cyclists are swerving into oncoming traffic during school drop-off hours to avoid the hole. Edges are jagged and expanding rapidly after recent rain.',
  },
  {
    title: 'Market Dumpster Overspill',
    badge: 'Public Health & Sanitation',
    category: 'Garbage',
    location: 'Rear service alleyway behind 542 5th Avenue Central Market',
    description:
      'Commercial dumpster has been overflowing for over 5 days with rotting organic food scraps and cardboard. Bags are torn open across the alley, blocking delivery trucks and pedestrian access. Significant rodent activity and severe odor affecting neighboring residential apartments and sidewalk cafes.',
  },
  {
    title: 'Main Water Line Rupture',
    badge: 'Critical Infrastructure',
    category: 'Water Leakage',
    location: 'Intersection of Oak St & 2nd Ave (Northwest corner)',
    description:
      'Underground municipal water main appears to have burst under high pressure. Clean potable water is gushing through cracked asphalt at a heavy rate, buckling the sidewalk and inundating basements of two adjacent retail storefronts. Water pressure in surrounding residential blocks has dropped to a trickle.',
  },
];

export const INITIAL_CIVIC_REPORTS: CivicReport[] = [
  {
    id: 'CIV-2026-081',
    category: 'Potholes',
    location: 'Elm St near Lincoln Elementary School',
    description:
      'Large asphalt depression and crumbling road surface near the school zone crosswalk. Drivers are braking abruptly.',
    reporterName: 'Marcus Vance',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: 'In Triage',
    citizenUpvotes: 4,
    aiAnalysis: {
      summary: 'Significant roadway depression in an active school transit zone creating abrupt deceleration hazards.',
      priority: 'High',
      priorityReason: 'Proximity to elementary school crosswalk elevates risk of vehicle collisions with pedestrians and school traffic.',
      recommendedAction: 'Dispatch road patrol for emergency cold-mix patching within 12 hours; schedule permanent milling resurfacing.',
      responsibleDepartment: 'Department of Transportation & Pavement Management',
      safetyHazardLevel: 'Moderate',
      estimatedResolutionHours: '24-48 Hours (Expedited Crew)',
      suggestedTags: ['Pothole', 'SchoolZone', 'TrafficHazard'],
    },
  },
  {
    id: 'CIV-2026-079',
    category: 'Water Leakage',
    location: 'Oak St & 2nd Ave, sidewalk grid',
    description:
      'Water bubbling up through the storm drain collar and pavement seam near the corner hydrant. Surface ponding is beginning to spread across lane 1.',
    reporterName: 'Elena Rostova',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), // 9 hours ago
    status: 'In Progress',
    citizenUpvotes: 7,
    aiAnalysis: {
      summary: 'Pressurized water seepage emerging through sub-base paving adjacent to primary intersection utility node.',
      priority: 'Critical',
      priorityReason: 'Sub-surface water erosion threatens roadway structural integrity and risks catastrophic foundation undermining if pressurized main fails.',
      recommendedAction: 'Shut off zone isolation valve #B-14 immediately; deploy vacuum excavation rig to expose pipe rupture.',
      responsibleDepartment: 'Municipal Water & Sewer Authority',
      safetyHazardLevel: 'Severe',
      estimatedResolutionHours: 'Under 4 Hours (Emergency Dispatch)',
      suggestedTags: ['WaterMain', 'SinkholeRisk', 'Infrastructure'],
    },
  },
  {
    id: 'CIV-2026-074',
    category: 'Broken Streetlights',
    location: 'Pine Crest Blvd, between 14th & 16th St',
    description:
      'Three consecutive LED streetlights are completely dark along the pedestrian sidewalk corridor. Very dim at night with poor visibility for evening joggers.',
    reporterName: 'Anonymous Citizen',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
    status: 'Dispatched',
    citizenUpvotes: 2,
    aiAnalysis: {
      summary: 'Multi-pole luminaire outage creating a dark corridor on a multi-block municipal pedestrian pathway.',
      priority: 'Medium',
      priorityReason: 'Reduced ambient lighting decreases pedestrian nighttime safety and security, though roadway headlights provide partial visibility.',
      recommendedAction: 'Inspect branch circuit breaker panel #PL-4; replace faulty photocells or ballast drivers.',
      responsibleDepartment: 'Department of Public Lighting & Grid',
      safetyHazardLevel: 'Low',
      estimatedResolutionHours: '3-5 Business Days (Standard Schedule)',
      suggestedTags: ['Streetlights', 'PedestrianSafety', 'Electrical'],
    },
  },
  {
    id: 'CIV-2026-068',
    category: 'Drainage',
    location: 'Riverview Terrace underpass, mile marker 3.2',
    description:
      'Storm sewer catch basin is completely packed with autumn dead leaves, plastic bottles, and silt. Water is standing 6 inches deep across the curb line after last night drizzle.',
    reporterName: 'Carlos Mendez',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    status: 'Submitted',
    citizenUpvotes: 1,
    aiAnalysis: {
      summary: 'Clogged storm drain culvert causing localized roadway ponding at an underpass approach.',
      priority: 'High',
      priorityReason: 'Underpass drainage failure presents severe hydroplaning hazard and flash flooding vulnerability in case of subsequent storm front.',
      recommendedAction: 'Deploy high-pressure jetting and suction truck to clear grate debris and jet lateral culvert pipe.',
      responsibleDepartment: 'Stormwater & Flood Control Agency',
      safetyHazardLevel: 'Moderate',
      estimatedResolutionHours: '24-48 Hours (Expedited Crew)',
      suggestedTags: ['Drainage', 'HydroplaneRisk', 'Culvert'],
    },
  },
  {
    id: 'CIV-2026-052',
    category: 'Garbage',
    location: 'Harbor Park public playground picnic area',
    description:
      'Two small green park trash bins overturned, litter scattered around the children swing set. Needs routine cleaning and bag replacement.',
    reporterName: 'Rachel Kim',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    status: 'Resolved',
    citizenUpvotes: 3,
    aiAnalysis: {
      summary: 'Overturned public park waste receptacles with non-hazardous scattered litter in recreational playground area.',
      priority: 'Low',
      priorityReason: 'Nuisance cosmetic litter without hazardous biological contaminants or traffic impediment.',
      recommendedAction: 'Route park maintenance groundskeeper for sweep-up and bin latch inspection.',
      responsibleDepartment: 'Bureau of Sanitation & Waste Solutions',
      safetyHazardLevel: 'None',
      estimatedResolutionHours: 'Routine Cycle (1-2 Weeks)',
      suggestedTags: ['ParkSanitation', 'Litter', 'ParksAndRec'],
    },
  },
  {
    id: 'CIV-2026-106',
    category: 'Potholes',
    location: 'College bus stop',
    description:
      'Hazardous pothole cluster on the approach lane to College bus stop causing vehicle swerving and tire damage.',
    reporterName: 'David Chen',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'In Triage',
    citizenUpvotes: 2,
    aiAnalysis: {
      summary: 'Road surface crumbling and pothole cluster in direct approach path of high-frequency college transit bus stop.',
      priority: 'High',
      priorityReason: 'Heavy municipal bus transit braking over compromised asphalt risks suspension failure and cyclist evasion collisions.',
      recommendedAction: 'Dispatch rapid cold-patch road patrol within 24 hours; schedule milling and surface restoration.',
      responsibleDepartment: 'Department of Transportation & Pavement Management',
      safetyHazardLevel: 'Moderate',
      estimatedResolutionHours: '24-48 Hours (Expedited Crew)',
      suggestedTags: ['Pothole', 'BusStop', 'TransitHazard'],
      extractedLocation: 'College bus stop',
    },
  },
  {
    id: 'CIV-2026-107',
    category: 'Streetlights',
    location: 'College bus stop',
    description:
      'Broken streetlight opposite the College bus stop leaving the transit area completely dark at night. Students waiting for evening buses feel unsafe.',
    reporterName: 'Priya Sharma',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    status: 'Submitted',
    citizenUpvotes: 1,
    aiAnalysis: {
      summary: 'Non-functioning overhead streetlight luminaire creating severe pedestrian visibility deficit at college transit node.',
      priority: 'Medium',
      priorityReason: 'Nighttime transit stop without illumination compromises pedestrian safety and personal security.',
      recommendedAction: 'Dispatch electrical line crew to test pole wiring and replace failed LED fixture.',
      responsibleDepartment: 'Department of Public Lighting & Grid',
      safetyHazardLevel: 'Low',
      estimatedResolutionHours: '3-5 Business Days (Standard Schedule)',
      suggestedTags: ['Streetlights', 'TransitSafety', 'LightingOutage'],
      extractedLocation: 'College bus stop',
    },
  },
  {
    id: 'CIV-2026-108',
    category: 'Potholes',
    location: 'College Main Gate',
    description:
      'Dangerous pothole on the main carriageway near College Main Gate. Multiple two-wheelers have skidded and vehicles are swerving into oncoming lane during rush hour.',
    reporterName: 'Arjun Patel',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'In Triage',
    citizenUpvotes: 3,
    aiAnalysis: {
      summary: 'Dangerous roadway crater on primary arterial road adjacent to College Main Gate causing vehicle deflection and skid hazards.',
      priority: 'High',
      priorityReason: 'Peak hour student traffic and abrupt vehicle evasion maneuvers into oncoming traffic present high collision risk.',
      recommendedAction: 'Deploy emergency pavement repair crew for cold-mix compaction within 12 hours.',
      responsibleDepartment: 'Department of Transportation & Pavement Management',
      safetyHazardLevel: 'Moderate',
      estimatedResolutionHours: '24-48 Hours (Expedited Crew)',
      suggestedTags: ['Pothole', 'CollegeMainGate', 'TrafficSafety'],
      extractedLocation: 'College Main Gate',
    },
  },
  {
    id: 'CIV-2026-109',
    category: 'Potholes',
    location: 'College Main Gate',
    description:
      'Dangerous pothole on the main carriageway near College Main Gate. Multiple two-wheelers have skidded and vehicles are swerving into oncoming lane during rush hour.',
    reporterName: 'Anonymous Citizen',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: 'Submitted',
    citizenUpvotes: 1,
    aiAnalysis: {
      summary: 'Dangerous roadway crater on primary arterial road adjacent to College Main Gate causing vehicle deflection and skid hazards.',
      priority: 'High',
      priorityReason: 'Peak hour student traffic and abrupt vehicle evasion maneuvers into oncoming traffic present high collision risk.',
      recommendedAction: 'Deploy emergency pavement repair crew for cold-mix compaction within 12 hours.',
      responsibleDepartment: 'Department of Transportation & Pavement Management',
      safetyHazardLevel: 'Moderate',
      estimatedResolutionHours: '24-48 Hours (Expedited Crew)',
      suggestedTags: ['Pothole', 'CollegeMainGate', 'TrafficSafety'],
      extractedLocation: 'College Main Gate',
    },
  },
];
