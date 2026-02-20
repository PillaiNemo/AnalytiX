import { CheckCircle } from 'lucide-react';
import type { FeatureSuggestion } from '@/types/analytics';

interface FeatureEngineeringProps {
  suggestions: FeatureSuggestion[];
}

const FeatureEngineering = ({ suggestions }: FeatureEngineeringProps) => (
  <div
    className="ax-fadeUp rounded-lg overflow-hidden"
    style={{
      background: 'var(--ax-card)',
      border: '1px solid var(--ax-border)',
      animationDelay: '1.3s',
    }}
  >
    <div className="p-4" style={{ borderBottom: '1px solid var(--ax-border)' }}>
      <h2 className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>Feature Engineering Recommendations</h2>
    </div>
    <div className="p-4">
      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center py-8">
          <CheckCircle size={32} style={{ color: 'var(--ax-green)' }} />
          <p className="font-syne text-sm mt-3" style={{ color: 'var(--ax-green)' }}>Dataset structure looks clean — no feature engineering required</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-md px-3.5 py-2.5"
              style={{
                background: 'var(--ax-card-alt)',
                border: '1px solid var(--ax-border)',
                borderLeft: '2px solid var(--ax-cyan)',
              }}
            >
              <span className="font-mono text-xs" style={{ color: 'var(--ax-cyan)' }}>{s.column}</span>
              <span className="font-mono text-xs" style={{ color: 'var(--ax-text)' }}>: {s.suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default FeatureEngineering;
