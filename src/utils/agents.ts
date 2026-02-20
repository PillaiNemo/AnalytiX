import Papa from 'papaparse';
import type { ColumnStats, ColumnType, Anomaly, Insight, ChartData, FeatureSuggestion } from '@/types/analytics';

// Agent 1: Parse CSV
export function parseCSV(file: File): Promise<{ rows: Record<string, unknown>[]; columns: { name: string; type: ColumnType }[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, unknown>[];
        if (!rows.length) { reject(new Error('Empty CSV')); return; }
        const fields = results.meta.fields || Object.keys(rows[0]);
        const columns = fields.map(name => {
          const vals = rows.map(r => r[name]).filter(v => v != null && v !== '');
          let numCount = 0, dateCount = 0;
          for (const v of vals) {
            if (typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '')) numCount++;
            if (v instanceof Date || (typeof v === 'string' && !isNaN(Date.parse(v)) && v.length > 6)) dateCount++;
          }
          const total = vals.length || 1;
          let type: ColumnType = 'string';
          if (numCount / total > 0.8) type = 'number';
          else if (dateCount / total > 0.8) type = 'date';
          return { name, type };
        });
        resolve({ rows, columns });
      },
      error: (err) => reject(err),
    });
  });
}

// Agent 2: Compute stats
export function computeStats(rows: Record<string, unknown>[], columns: { name: string; type: ColumnType }[]): { stats: ColumnStats[]; qualityScore: number } {
  const stats: ColumnStats[] = columns.map(col => {
    const values = rows.map(r => r[col.name]);
    const nullCount = values.filter(v => v == null || v === '' || (typeof v === 'string' && v.trim() === '')).length;
    const nullPercent = Math.round((nullCount / rows.length) * 1000) / 10;
    const nonNull = values.filter(v => v != null && v !== '');
    const uniqueCount = new Set(nonNull.map(String)).size;

    const freq: Record<string, number> = {};
    for (const v of nonNull) { const k = String(v); freq[k] = (freq[k] || 0) + 1; }
    const topValues = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    const stat: ColumnStats = { name: col.name, type: col.type, nullCount, nullPercent, uniqueCount, topValues };

    if (col.type === 'number') {
      const nums = nonNull.map(Number).filter(n => !isNaN(n));
      if (nums.length > 0) {
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const sorted = [...nums].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length;
        const stdDev = Math.sqrt(variance);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const skewness = stdDev !== 0 ? Math.round(((mean - median) / stdDev) * 100) / 100 : 0;
        Object.assign(stat, { mean: Math.round(mean * 100) / 100, median: Math.round(median * 100) / 100, stdDev: Math.round(stdDev * 100) / 100, min, max, skewness });
      }
    }
    return stat;
  });

  const avgNull = stats.reduce((s, c) => s + c.nullPercent, 0) / (stats.length || 1);
  let qs = 100 - 1.5 * avgNull;
  if (stats.some(c => c.nullPercent > 50)) qs -= 10;
  if (stats.some(c => c.type === 'number' && c.skewness != null && Math.abs(c.skewness) > 3)) qs -= 5;
  const qualityScore = Math.round(Math.max(0, Math.min(100, qs)));

  return { stats, qualityScore };
}

// Agent 3: Prepare chart data
export function prepareCharts(rows: Record<string, unknown>[], stats: ColumnStats[]): ChartData {
  const numCols = stats.filter(c => c.type === 'number' && c.min != null);
  const strCols = stats.filter(c => c.type === 'string');

  // Distribution for first numeric col
  let distribution: { range: string; count: number }[] = [];
  let distributionCol = '';
  if (numCols.length > 0) {
    const col = numCols[0];
    distributionCol = col.name;
    const min = col.min!;
    const max = col.max!;
    const bucketSize = (max - min) / 10 || 1;
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${Math.round((min + i * bucketSize) * 10) / 10}`,
      count: 0,
    }));
    for (const r of rows) {
      const v = Number(r[col.name]);
      if (isNaN(v)) continue;
      let idx = Math.floor((v - min) / bucketSize);
      if (idx >= 10) idx = 9;
      if (idx < 0) idx = 0;
      buckets[idx].count++;
    }
    distribution = buckets;
  }

  // Completeness
  const completeness = stats.map(c => ({ name: c.name.slice(0, 8), nullPercent: c.nullPercent }));

  // Top values for first string col
  let topValues: { value: string; count: number }[] = [];
  let topValuesCol = '';
  if (strCols.length > 0) {
    topValuesCol = strCols[0].name;
    topValues = strCols[0].topValues.slice(0, 8);
  } else if (numCols.length > 1) {
    // Fallback: second numeric distribution
    const col = numCols[1];
    topValuesCol = col.name;
    const min = col.min!;
    const max = col.max!;
    const bs = (max - min) / 8 || 1;
    topValues = Array.from({ length: 8 }, (_, i) => {
      const lo = min + i * bs;
      return { value: `${Math.round(lo * 10) / 10}`, count: 0 };
    });
    for (const r of rows) {
      const v = Number(r[col.name]);
      if (isNaN(v)) continue;
      let idx = Math.floor((v - min) / bs);
      if (idx >= 8) idx = 7;
      if (idx < 0) idx = 0;
      topValues[idx].count++;
    }
  }

  // Scatter
  let scatter: { x: number; y: number }[] | null = null;
  let scatterColX = '', scatterColY = '';
  let fallbackUniqueChart: { name: string; uniqueCount: number }[] | null = null;
  if (numCols.length >= 2) {
    scatterColX = numCols[0].name;
    scatterColY = numCols[1].name;
    let sampleRows = rows;
    if (rows.length > 10000) {
      const shuffled = [...rows].sort(() => Math.random() - 0.5);
      sampleRows = shuffled.slice(0, 5000);
    }
    scatter = sampleRows.map(r => ({ x: Number(r[scatterColX]) || 0, y: Number(r[scatterColY]) || 0 }));
  } else {
    fallbackUniqueChart = stats.map(c => ({ name: c.name.slice(0, 8), uniqueCount: c.uniqueCount }));
  }

  return { distribution, distributionCol, completeness, topValues, topValuesCol, scatter, scatterColX, scatterColY, fallbackUniqueChart };
}

// Agent 4: Detect anomalies
export function detectAnomalies(rows: Record<string, unknown>[], stats: ColumnStats[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const numCols = stats.filter(c => c.type === 'number' && c.stdDev != null && c.stdDev !== 0);

  for (const col of numCols) {
    const mean = col.mean!;
    const std = col.stdDev!;
    for (let i = 0; i < rows.length; i++) {
      const v = Number(rows[i][col.name]);
      if (isNaN(v)) continue;
      const z = (v - mean) / std;
      if (Math.abs(z) > 3) {
        anomalies.push({
          rowIndex: i,
          column: col.name,
          value: v,
          zScore: Math.round(z * 100) / 100,
          severity: Math.abs(z) > 4 ? 'severe' : 'mild',
        });
      }
    }
  }

  anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  return anomalies.slice(0, 100);
}

// Agent 5: Gemini insights
export async function generateInsights(
  fileName: string,
  rowCount: number,
  stats: ColumnStats[]
): Promise<Insight[] | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const schema = {
    fileName,
    rowCount,
    columns: stats.map(c => {
      const base: Record<string, unknown> = { name: c.name, type: c.type, nullPercent: c.nullPercent, uniqueCount: c.uniqueCount };
      if (c.type === 'number') { Object.assign(base, { mean: c.mean, stdDev: c.stdDev, min: c.min, max: c.max, skewness: c.skewness }); }
      if (c.type === 'string') { base.topValues = c.topValues.slice(0, 3); }
      return base;
    }),
  };

  const prompt = `You are a senior data scientist. Analyze this dataset statistical profile and generate exactly 4 specific, actionable insights based on the actual column names and values provided. Each insight must reference specific columns or statistics from the data. Return ONLY a raw JSON array with no markdown, no code fences, no explanation: [{title, finding, recommendation, confidence}] where confidence is a number between 70 and 98.\n\n${JSON.stringify(schema)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(text) as Insight[];
  } catch {
    return null;
  }
}

// Feature engineering suggestions
export function generateFeatureSuggestions(stats: ColumnStats[], rowCount: number): FeatureSuggestion[] {
  const suggestions: FeatureSuggestion[] = [];
  for (const col of stats) {
    if (col.type === 'date') {
      suggestions.push({ column: col.name, suggestion: 'Extract month, weekday, and hour as numeric features' });
    }
    if (col.type === 'string' && col.uniqueCount > rowCount * 0.5) {
      suggestions.push({ column: col.name, suggestion: 'High cardinality — apply target or frequency encoding' });
    }
    if (col.type === 'string' && col.uniqueCount <= 10) {
      suggestions.push({ column: col.name, suggestion: 'Low cardinality — safe to one-hot encode directly' });
    }
    if (col.type === 'number' && col.skewness != null && Math.abs(col.skewness) > 1) {
      suggestions.push({ column: col.name, suggestion: 'Skewed distribution — apply log1p transform' });
    }
    if (col.type === 'number' && col.nullPercent > 20) {
      suggestions.push({ column: col.name, suggestion: 'High null rate — apply median imputation or drop column' });
    }
    if (col.type === 'number' && col.stdDev === 0) {
      suggestions.push({ column: col.name, suggestion: 'Zero variance detected — remove this constant feature' });
    }
    if (col.type === 'number' && col.nullPercent > 1 && col.nullPercent <= 20) {
      suggestions.push({ column: col.name, suggestion: 'Missing values present — impute with column median' });
    }
  }
  return suggestions;
}
