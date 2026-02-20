import { Sparkles, AlertCircle } from 'lucide-react';
import type { Insight } from '@/types/analytics';

interface InsightsSectionProps {
  insights: Insight[] | null;
}

const InsightsSection = ({ insights }: InsightsSectionProps) => (
  <div
    className="ax-fadeUp rounded-lg overflow-hidden"
    style={{
      background: 'var(--ax-card)',
      border: '1px solid var(--ax-border)',
      animationDelay: '1.1s',
    }}
  >
    <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--ax-border)' }}>
      <h2 className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>Generative Insights Engine</h2>
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} style={{ color: 'var(--ax-muted)' }} />
        <span className="font-syne text-[10px]" style={{ color: 'var(--ax-muted)' }}>Powered by Gemini Flash</span>
      </div>
    </div>

    <div className="p-4">
      {insights === null ? (
        <div className="flex flex-col items-center py-8">
          <AlertCircle size={32} style={{ color: 'var(--ax-red)' }} />
          <p className="font-syne text-sm mt-3" style={{ color: 'var(--ax-red)' }}>Unable to generate insights</p>
          <p className="font-syne text-xs mt-1" style={{ color: 'var(--ax-muted)' }}>Set VITE_GEMINI_API_KEY in your environment to enable AI insights</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {insights.map((ins, i) => (
            <div
              key={i}
              className="rounded-lg p-4"
              style={{
                background: 'var(--ax-card-alt)',
                border: '1px solid var(--ax-border)',
                borderLeft: '3px solid var(--ax-cyan)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                  style={{ color: 'var(--ax-cyan)', border: '1px solid rgba(0,245,255,0.3)' }}>
                  #0{i + 1}
                </span>
                <span className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>{ins.title}</span>
              </div>
              <p className="font-syne text-xs mt-2" style={{ color: 'var(--ax-text-secondary)' }}>{ins.finding}</p>
              <p className="font-syne text-xs italic mt-1.5" style={{ color: 'var(--ax-amber)' }}>→ {ins.recommendation}</p>
              <div className="flex items-center justify-between mt-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-syne text-[10px]" style={{ color: 'var(--ax-muted)' }}>Confidence</span>
                  <div style={{ width: 80, height: 4, background: 'var(--ax-border)', borderRadius: 2 }}>
                    <div style={{ width: `${ins.confidence}%`, height: 4, background: 'var(--ax-cyan)', borderRadius: 2 }} />
                  </div>
                  <span className="font-mono text-xs" style={{ color: 'var(--ax-cyan)' }}>{ins.confidence}%</span>
                </div>
                <div className="flex gap-2">
                  {['Evidence ↗', 'Recommendation ↗'].map(label => (
                    <span key={label} className="font-syne text-[10px] px-2.5 py-1 rounded"
                      style={{ border: '1px solid var(--ax-border)', color: 'var(--ax-muted)' }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default InsightsSection;
