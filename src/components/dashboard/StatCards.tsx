import { Database, Columns3, ShieldCheck, AlertTriangle } from 'lucide-react';

interface StatCardsProps {
  rowCount: number;
  columnCount: number;
  qualityScore: number;
  anomalyCount: number;
}

const StatCards = ({ rowCount, columnCount, qualityScore, anomalyCount }: StatCardsProps) => {
  const scoreColor = qualityScore >= 80 ? 'var(--ax-green)' : qualityScore >= 60 ? 'var(--ax-amber)' : 'var(--ax-red)';
  const anomalyColor = anomalyCount > 0 ? 'var(--ax-amber)' : 'var(--ax-green)';

  const cards = [
    { label: 'Total Records', value: rowCount.toLocaleString(), color: 'var(--ax-cyan)', icon: Database },
    { label: 'Feature Columns', value: columnCount.toString(), color: 'var(--ax-cyan)', icon: Columns3 },
    { label: 'Integrity Score', value: `${qualityScore}/100`, color: scoreColor, icon: ShieldCheck },
    { label: 'Anomalies Detected', value: anomalyCount.toString(), color: anomalyColor, icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="ax-fadeUp relative rounded-lg p-5"
          style={{
            background: 'var(--ax-card)',
            borderTop: `2px solid ${card.color}`,
            borderLeft: '1px solid var(--ax-border)',
            borderRight: '1px solid var(--ax-border)',
            borderBottom: '1px solid var(--ax-border)',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <card.icon size={20} className="absolute top-4 right-4" style={{ color: 'var(--ax-muted)' }} />
          <div className="font-mono text-3xl font-bold" style={{ color: card.color }}>{card.value}</div>
          <div className="font-syne text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--ax-muted)' }}>{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
