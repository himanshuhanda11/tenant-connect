import type { Deal, PipelineStage } from '@/types/crm';

const HEADERS = [
  'title', 'company_name', 'value', 'currency', 'priority', 'status',
  'stage', 'lead_source', 'tags', 'expected_close_date', 'created_at',
];

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportDealsToCsv(deals: Deal[], stages: PipelineStage[], filename = 'deals.csv') {
  const stageMap = Object.fromEntries(stages.map(s => [s.id, s.name]));
  const rows = [HEADERS.join(',')];
  for (const d of deals) {
    rows.push([
      d.title, d.company_name ?? '', d.value, d.currency, d.priority, d.status,
      stageMap[d.stage_id] ?? '', d.lead_source ?? '', (d.tags ?? []).join('|'),
      d.expected_close_date ?? '', d.created_at,
    ].map(escapeCsv).join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Parse a CSV string into rows. Handles quoted fields and escaped quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { cur.push(field); field = ''; i++; continue; }
    if (c === '\n' || c === '\r') {
      cur.push(field); rows.push(cur); cur = []; field = '';
      if (c === '\r' && text[i + 1] === '\n') i++;
      i++; continue;
    }
    field += c; i++;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

export interface ParsedDealRow {
  title: string;
  company_name?: string | null;
  value?: number;
  currency?: string;
  priority?: string;
  status?: string;
  stage?: string;
  lead_source?: string | null;
  tags?: string[];
  expected_close_date?: string | null;
}

export function csvToDealRows(text: string): { rows: ParsedDealRow[]; errors: string[] } {
  const matrix = parseCsv(text);
  const errors: string[] = [];
  if (matrix.length === 0) return { rows: [], errors: ['Empty CSV'] };
  const header = matrix[0].map(h => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const iTitle = idx('title');
  if (iTitle === -1) return { rows: [], errors: ['CSV must include a "title" column'] };

  const rows: ParsedDealRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const title = (row[iTitle] || '').trim();
    if (!title) continue;
    const get = (n: string) => { const i = idx(n); return i === -1 ? '' : (row[i] ?? '').trim(); };
    const tags = get('tags');
    rows.push({
      title,
      company_name: get('company_name') || get('company') || null,
      value: Number(get('value')) || 0,
      currency: (get('currency') || 'USD').toUpperCase(),
      priority: (get('priority') || 'normal').toLowerCase(),
      status: (get('status') || 'open').toLowerCase(),
      stage: get('stage'),
      lead_source: get('lead_source') || get('source') || null,
      tags: tags ? tags.split(/[|,;]/).map(t => t.trim()).filter(Boolean) : [],
      expected_close_date: get('expected_close_date') || null,
    });
  }
  return { rows, errors };
}
