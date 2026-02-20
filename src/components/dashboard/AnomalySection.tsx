import { CheckCircle } from 'lucide-react';
import type { Anomaly } from '@/types/analytics';

interface AnomalySectionProps {
  anomalies: Anomaly[];
  totalRows: number;
}

const AnomalySection = ({ anomalies, totalRows }: AnomalySectionProps) => {
  const affectedCols = new Set(anomalies.map(a => a.column)).size;
  const flaggedPercent = totalRows > 0 ? Math.round((anomalies.length / totalRows) * 10000) / 100 : 0;
  const shown = anomalies.slice(0, 20);

  return (
    <div
      className="ax-fadeUp rounded-lg overflow-hidden"
      style={{
        background: 'var(--ax-card)',
        border: '1px solid var(--ax-border)',
        animationDelay: '0.9s',
      }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--ax-border)' }}>
        <h2 className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>Anomaly Detection Matrix</h2>
        <div className="flex gap-2">
          {['Z-Score ✓', 'IQR Method ✓'].map(label => (
            <span key={label} className="font-syne text-[10px] px-2 py-0.5 rounded"
              style={{ border: '1px solid rgba(0,255,136,0.3)', color: 'var(--ax-green)', background: 'rgba(0,255,136,0.05)' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <CheckCircle size={48} style={{ color: 'var(--ax-green)' }} />
          <p className="font-syne text-base mt-3" style={{ color: 'var(--ax-green)' }}>No Anomalies Detected</p>
          <p className="font-syne text-xs mt-1" style={{ color: 'var(--ax-muted)' }}>All values fall within 3 standard deviations</p>
        </div>
      ) : (
        <div className="p-4">
          <p className="font-mono text-xs mb-4" style={{ color: 'var(--ax-amber)' }}>
            {anomalies.length} anomalies detected across {affectedCols} columns · {flaggedPercent}% of records flagged
          </p>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ax-card-alt)' }}>
                  {['Row Index', 'Column', 'Value', 'Z-Score', 'Severity'].map(h => (
                    <th key={h} className="font-syne text-[10px] uppercase tracking-wider text-left px-3.5 py-2.5"
                      style={{ color: 'var(--ax-muted)', borderBottom: '1px solid var(--ax-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--ax-border)' }}>
                    <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: 'var(--ax-muted)' }}>{a.rowIndex}</td>
                    <td className="px-3.5 py-2.5 font-syne text-sm" style={{ color: 'var(--ax-text)' }}>{a.column}</td>
                    <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: 'var(--ax-cyan)' }}>{a.value}</td>
                    <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: Math.abs(a.zScore) > 4 ? 'var(--ax-red)' : 'var(--ax-amber)' }}>{a.zScore}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-syne text-[10px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: a.severity === 'severe' ? 'rgba(255,69,96,0.08)' : 'rgba(255,184,0,0.08)',
                          border: `1px solid ${a.severity === 'severe' ? 'rgba(255,69,96,0.25)' : 'rgba(255,184,0,0.25)'}`,
                          color: a.severity === 'severe' ? 'var(--ax-red)' : 'var(--ax-amber)',
                        }}>
                        {a.severity === 'severe' ? 'Severe' : 'Mild'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {anomalies.length > 20 && (
            <p className="font-syne text-xs mt-3" style={{ color: 'var(--ax-muted)' }}>
              Showing 20 of {anomalies.length} anomalies
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnomalySection;
