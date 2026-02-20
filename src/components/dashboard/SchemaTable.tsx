import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { ColumnStats } from '@/types/analytics';

interface SchemaTableProps {
  columns: ColumnStats[];
}

const TypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    number: { bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.25)', color: '#00F5FF', label: 'NUM' },
    string: { bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.25)', color: '#FFB800', label: 'STR' },
    date: { bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.25)', color: '#00FF88', label: 'DATE' },
  };
  const s = styles[type] || styles.string;
  return (
    <span
      className="font-syne text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const NullBar = ({ percent }: { percent: number }) => {
  const color = percent < 5 ? 'var(--ax-green)' : percent <= 15 ? 'var(--ax-amber)' : 'var(--ax-red)';
  return (
    <div>
      <span className="font-mono text-xs" style={{ color: 'var(--ax-text)' }}>{percent}%</span>
      <div className="mt-1 w-full" style={{ height: 3, background: 'var(--ax-border)', borderRadius: 2 }}>
        <div style={{ height: 3, width: `${Math.min(percent, 100)}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
};

const SchemaTable = ({ columns }: SchemaTableProps) => {
  const [filter, setFilter] = useState('');
  const filtered = useMemo(
    () => columns.filter(c => c.name.toLowerCase().includes(filter.toLowerCase())),
    [columns, filter]
  );

  const headers = ['Column Name', 'Type', 'Null %', 'Unique Values', 'Mean', 'Std Dev', 'Skewness'];

  return (
    <div
      className="ax-fadeUp rounded-lg overflow-hidden"
      style={{
        background: 'var(--ax-card)',
        border: '1px solid var(--ax-border)',
        animationDelay: '0.5s',
      }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--ax-border)' }}>
        <h2 className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>Schema & Column Diagnostics</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ax-muted)' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter columns..."
            className="font-mono text-xs rounded-md py-2 pl-9 pr-3 outline-none transition-colors"
            style={{
              background: 'var(--ax-card-alt)',
              border: '1px solid var(--ax-border)',
              color: 'var(--ax-text)',
              width: 200,
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--ax-cyan)')}
            onBlur={e => (e.target.style.borderColor = 'var(--ax-border)')}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ax-card-alt)' }}>
              {headers.map(h => (
                <th
                  key={h}
                  className="font-syne text-[10px] uppercase tracking-wider text-left px-3.5 py-2.5"
                  style={{ color: 'var(--ax-muted)', borderBottom: '1px solid var(--ax-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((col, i) => (
              <tr
                key={col.name}
                className="transition-colors duration-150"
                style={{
                  background: i % 2 === 0 ? 'var(--ax-card)' : '#0C1020',
                  borderBottom: '1px solid var(--ax-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#131C35')}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'var(--ax-card)' : '#0C1020')}
              >
                <td className="px-3.5 py-2.5 font-syne text-sm" style={{ color: 'var(--ax-text)' }}>{col.name}</td>
                <td className="px-3.5 py-2.5"><TypeBadge type={col.type} /></td>
                <td className="px-3.5 py-2.5"><NullBar percent={col.nullPercent} /></td>
                <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: 'var(--ax-cyan)' }}>{col.uniqueCount.toLocaleString()}</td>
                <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: col.mean != null ? 'var(--ax-cyan)' : 'var(--ax-muted)' }}>{col.mean != null ? col.mean : '—'}</td>
                <td className="px-3.5 py-2.5 font-mono text-xs" style={{ color: col.stdDev != null ? 'var(--ax-cyan)' : 'var(--ax-muted)' }}>{col.stdDev != null ? col.stdDev : '—'}</td>
                <td className="px-3.5 py-2.5 font-mono text-xs" style={{
                  color: col.skewness == null ? 'var(--ax-muted)' :
                    col.skewness > 0.5 ? 'var(--ax-amber)' :
                    col.skewness < -0.5 ? 'var(--ax-cyan)' : 'var(--ax-muted)'
                }}>
                  {col.skewness == null ? '—' : `${col.skewness}${col.skewness > 0.5 ? ' ↑' : col.skewness < -0.5 ? ' ↓' : ''}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--ax-border)' }}>
        <span className="font-syne text-xs" style={{ color: 'var(--ax-muted)' }}>
          Showing {filtered.length} of {columns.length} columns
        </span>
      </div>
    </div>
  );
};

export default SchemaTable;
