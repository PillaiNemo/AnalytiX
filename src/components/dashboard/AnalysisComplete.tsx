import { useState } from 'react';
import { CheckCircle, Copy, Download } from 'lucide-react';
import type { DatasetProfile } from '@/types/analytics';
import { generateReport } from '@/utils/reportGenerator';

interface AnalysisCompleteProps {
  profile: DatasetProfile;
}

const AnalysisComplete = ({ profile }: AnalysisCompleteProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const summary = [
      `Dataset: ${profile.fileName}`,
      `Rows: ${profile.rowCount.toLocaleString()}`,
      `Columns: ${profile.columnCount}`,
      `Quality Score: ${profile.qualityScore}/100`,
      `Anomalies: ${profile.anomalies.length}`,
      '',
      ...(profile.insights?.map((ins, i) => `Insight #${i + 1}: ${ins.title} — ${ins.finding}`) || []),
    ].join('\n');
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const html = generateReport(profile);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytix-report-${profile.fileName.replace('.csv', '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="ax-fadeUp rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        background: 'var(--ax-card)',
        border: '1px solid var(--ax-border)',
        animationDelay: '1.5s',
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} style={{ color: 'var(--ax-green)' }} />
          <span className="font-syne text-sm" style={{ color: 'var(--ax-green)' }}>Analysis Complete</span>
        </div>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--ax-muted)' }}>
          {profile.fileName} · {profile.rowCount.toLocaleString()} rows · {profile.columnCount} columns · {profile.insights?.length || 0} insights generated
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 font-syne text-xs rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          style={{
            border: `1px solid ${copied ? 'var(--ax-green)' : 'var(--ax-cyan)'}`,
            color: copied ? 'var(--ax-green)' : 'var(--ax-cyan)',
            background: 'transparent',
          }}
        >
          <Copy size={14} />
          {copied ? 'Copied ✓' : 'Copy Summary'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 font-syne text-xs font-bold rounded-lg px-5 py-2.5 transition-opacity hover:opacity-80 cursor-pointer"
          style={{
            background: 'var(--ax-amber)',
            color: 'var(--ax-bg)',
          }}
        >
          <Download size={14} />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default AnalysisComplete;
