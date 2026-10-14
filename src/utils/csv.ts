import { CivicReport } from '../types';

export function exportReportsToCSV(reports: CivicReport[]): void {
  const headers = [
    'Report ID',
    'Category',
    'Location',
    'Priority',
    'Status',
    'Timestamp',
    'Reporter',
    'Upvotes',
    'Description',
    'AI Summary',
    'Responsible Department',
    'Priority Reason',
    'Recommended Action',
    'Safety Hazard Level',
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = reports.map((r) => [
    escapeCSV(r.id),
    escapeCSV(r.category),
    escapeCSV(r.location),
    escapeCSV(r.aiAnalysis?.priority || 'Pending Triage'),
    escapeCSV(r.status),
    escapeCSV(new Date(r.timestamp).toLocaleString()),
    escapeCSV(r.reporterName || 'Anonymous'),
    escapeCSV(r.citizenUpvotes || 0),
    escapeCSV(r.description),
    escapeCSV(r.aiAnalysis?.summary || ''),
    escapeCSV(r.aiAnalysis?.responsibleDepartment || ''),
    escapeCSV(r.aiAnalysis?.priorityReason || ''),
    escapeCSV(r.aiAnalysis?.recommendedAction || ''),
    escapeCSV(r.aiAnalysis?.safetyHazardLevel || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `civiclens_complaints_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
