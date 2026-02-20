import type { DatasetProfile } from '@/types/analytics';

export function generateReport(profile: DatasetProfile): string {
  const { fileName, rowCount, columnCount, qualityScore, columns, anomalies, insights, featureSuggestions } = profile;
  const timestamp = new Date().toLocaleString();

  const scoreColor = qualityScore >= 80 ? '#00FF88' : qualityScore >= 60 ? '#FFB800' : '#FF4560';

  const columnsRows = columns.map(c => `
    <tr>
      <td style="padding:10px 14px;font-family:'Syne',sans-serif;font-size:13px;color:#E8EDF5">${c.name}</td>
      <td style="padding:10px 14px"><span style="padding:2px 8px;border-radius:4px;font-size:10px;font-family:'Syne',sans-serif;font-weight:600;${
        c.type === 'number' ? 'background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.25);color:#00F5FF' :
        c.type === 'date' ? 'background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.25);color:#00FF88' :
        'background:rgba(255,184,0,0.08);border:1px solid rgba(255,184,0,0.25);color:#FFB800'
      }">${c.type === 'number' ? 'NUM' : c.type === 'date' ? 'DATE' : 'STR'}</span></td>
      <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#E8EDF5">${c.nullPercent}%</td>
      <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#00F5FF">${c.uniqueCount.toLocaleString()}</td>
      <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#00F5FF">${c.mean != null ? c.mean : '—'}</td>
      <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#00F5FF">${c.stdDev != null ? c.stdDev : '—'}</td>
      <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#5A7090">${c.skewness != null ? c.skewness : '—'}</td>
    </tr>
  `).join('');

  const anomalySection = anomalies.length === 0
    ? `<div style="text-align:center;padding:40px"><p style="color:#00FF88;font-family:'Syne',sans-serif;font-size:16px">✓ No Anomalies Detected</p><p style="color:#5A7090;font-size:12px;font-family:'Syne',sans-serif">All values fall within 3 standard deviations</p></div>`
    : `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#0A0E1A">
          <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Row</th>
          <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Column</th>
          <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Value</th>
          <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Z-Score</th>
          <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Severity</th>
        </tr></thead>
        <tbody>${anomalies.slice(0, 20).map(a => `
          <tr style="border-bottom:1px solid #1E2D4A">
            <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#5A7090">${a.rowIndex}</td>
            <td style="padding:10px 14px;font-family:'Syne',sans-serif;font-size:13px;color:#E8EDF5">${a.column}</td>
            <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#00F5FF">${a.value}</td>
            <td style="padding:10px 14px;font-family:'JetBrains Mono',monospace;font-size:12px;color:${Math.abs(a.zScore) > 4 ? '#FF4560' : '#FFB800'}">${a.zScore}</td>
            <td style="padding:10px 14px;font-family:'Syne',sans-serif;font-size:11px;color:${a.severity === 'severe' ? '#FF4560' : '#FFB800'}">${a.severity}</td>
          </tr>
        `).join('')}</tbody>
      </table>`;

  const insightsSection = insights
    ? insights.map((ins, i) => `
      <div style="background:#0A0E1A;border:1px solid #1E2D4A;border-left:3px solid #00F5FF;border-radius:8px;padding:16px;margin-bottom:10px">
        <div><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#00F5FF;border:1px solid rgba(0,245,255,0.3);border-radius:4px;padding:2px 8px;margin-right:10px">#0${i + 1}</span><strong style="font-family:'Syne',sans-serif;font-size:13px;color:#E8EDF5">${ins.title}</strong></div>
        <p style="font-family:'Syne',sans-serif;font-size:12px;color:#A0B0C8;margin-top:8px">${ins.finding}</p>
        <p style="font-family:'Syne',sans-serif;font-size:12px;color:#FFB800;font-style:italic;margin-top:6px">→ ${ins.recommendation}</p>
        <p style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#00F5FF;margin-top:8px">Confidence: ${ins.confidence}%</p>
      </div>
    `).join('')
    : `<p style="color:#FF4560;font-family:'Syne',sans-serif">AI insights not available</p>`;

  const featureSection = featureSuggestions.length === 0
    ? `<p style="color:#00FF88;font-family:'Syne',sans-serif;text-align:center;padding:20px">✓ Dataset structure looks clean</p>`
    : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${featureSuggestions.map(f => `
      <div style="background:#0A0E1A;border:1px solid #1E2D4A;border-left:2px solid #00F5FF;border-radius:6px;padding:10px 14px">
        <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#00F5FF">${f.column}</span><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#E8EDF5">: ${f.suggestion}</span>
      </div>
    `).join('')}</div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>AnalytiX Report — ${fileName}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Syne:wght@400;700;800&display=swap" rel="stylesheet">
<style>body{margin:0;padding:40px;background:#080C18;color:#E8EDF5;font-family:'Syne',sans-serif}
.card{background:#0F1629;border:1px solid #1E2D4A;border-radius:8px;padding:24px;margin-bottom:20px}
h2{font-size:14px;font-weight:700;margin:0 0 16px 0}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
.stat{background:#0F1629;border:1px solid #1E2D4A;border-radius:8px;padding:20px}
.stat-value{font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700}
.stat-label{font-size:11px;color:#5A7090;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px}
</style></head><body>
<div style="text-align:center;margin-bottom:40px">
  <h1 style="font-size:24px;font-weight:800;margin:0"><span style="color:#E8EDF5">Analyt</span><span style="color:#00F5FF">iX</span> <span style="font-size:14px;color:#5A7090;font-weight:400">Report</span></h1>
  <p style="color:#5A7090;font-size:12px;margin-top:8px">Generated ${timestamp} · ${fileName}</p>
</div>
<div class="stat-grid">
  <div class="stat" style="border-top:2px solid #00F5FF"><div class="stat-value" style="color:#00F5FF">${rowCount.toLocaleString()}</div><div class="stat-label">Total Records</div></div>
  <div class="stat" style="border-top:2px solid #00F5FF"><div class="stat-value" style="color:#00F5FF">${columnCount}</div><div class="stat-label">Feature Columns</div></div>
  <div class="stat" style="border-top:2px solid ${scoreColor}"><div class="stat-value" style="color:${scoreColor}">${qualityScore}/100</div><div class="stat-label">Integrity Score</div></div>
  <div class="stat" style="border-top:2px solid ${anomalies.length > 0 ? '#FFB800' : '#00FF88'}"><div class="stat-value" style="color:${anomalies.length > 0 ? '#FFB800' : '#00FF88'}">${anomalies.length}</div><div class="stat-label">Anomalies</div></div>
</div>
<div class="card"><h2>Column Statistics</h2>
<table style="width:100%;border-collapse:collapse">
<thead><tr style="background:#0A0E1A">
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Column</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Type</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Null %</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Unique</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Mean</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Std Dev</th>
  <th style="padding:10px 14px;text-align:left;font-family:'Syne',sans-serif;font-size:10px;color:#5A7090;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #1E2D4A">Skewness</th>
</tr></thead>
<tbody>${columnsRows}</tbody>
</table></div>
<div class="card"><h2>Anomaly Detection</h2>${anomalySection}</div>
<div class="card"><h2>AI-Generated Insights</h2>${insightsSection}</div>
<div class="card"><h2>Feature Engineering</h2>${featureSection}</div>
<div style="text-align:center;color:#5A7090;font-size:11px;margin-top:40px;padding-bottom:40px">AnalytiX Report · Autonomous Data Intelligence Platform</div>
</body></html>`;
}
