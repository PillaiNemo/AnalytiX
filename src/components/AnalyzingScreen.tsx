import { useEffect, useState, useRef, useCallback } from 'react';
import { Minus, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Logo from './Logo';
import type { AgentStep, AgentStatus, DatasetProfile } from '@/types/analytics';
import { parseCSV, computeStats, prepareCharts, detectAnomalies, generateInsights, generateFeatureSuggestions } from '@/utils/agents';

interface AnalyzingScreenProps {
  file: File;
  onComplete: (profile: DatasetProfile) => void;
}

const AGENTS: { name: string; description: string }[] = [
  { name: 'Profiling Agent', description: 'Parsing dataset schema and structure' },
  { name: 'Statistical Engine', description: 'Computing column statistics' },
  { name: 'Visualization Agent', description: 'Preparing interactive charts' },
  { name: 'Anomaly Detector', description: 'Running Z-score outlier analysis' },
  { name: 'Insight Generator', description: 'Calling Gemini Flash AI' },
];

const StatusIcon = ({ status }: { status: AgentStatus }) => {
  const base = 'flex items-center justify-center rounded-full shrink-0';
  switch (status) {
    case 'pending':
      return <div className={base} style={{ width: 32, height: 32, border: '1px solid var(--ax-border)' }}><Minus size={14} style={{ color: 'var(--ax-muted)' }} /></div>;
    case 'active':
      return <div className={base} style={{ width: 32, height: 32, border: '2px solid var(--ax-cyan)' }}><Loader2 size={14} className="ax-spin" style={{ color: 'var(--ax-cyan)' }} /></div>;
    case 'complete':
      return <div className={base} style={{ width: 32, height: 32, border: '2px solid var(--ax-green)' }}><CheckCircle size={14} style={{ color: 'var(--ax-green)' }} /></div>;
    case 'error':
      return <div className={base} style={{ width: 32, height: 32, border: '2px solid var(--ax-red)' }}><XCircle size={14} style={{ color: 'var(--ax-red)' }} /></div>;
  }
};

const AnalyzingScreen = ({ file, onComplete }: AnalyzingScreenProps) => {
  const [steps, setSteps] = useState<AgentStep[]>(
    AGENTS.map(a => ({ ...a, status: 'pending' as AgentStatus, elapsed: 0 }))
  );
  const [progress, setProgress] = useState(0);
  const hasRun = useRef(false);

  const updateStep = useCallback((idx: number, patch: Partial<AgentStep>) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const timers: number[] = [];

      const runStep = async <T,>(idx: number, fn: () => Promise<T> | T): Promise<T> => {
        updateStep(idx, { status: 'active' });
        const start = performance.now();
        const intervalId = window.setInterval(() => {
          updateStep(idx, { elapsed: Math.round((performance.now() - start) / 100) / 10 });
        }, 100);
        timers.push(intervalId);
        try {
          const result = await fn();
          clearInterval(intervalId);
          const elapsed = Math.round((performance.now() - start) / 100) / 10;
          updateStep(idx, { status: 'complete', elapsed });
          setProgress(prev => prev + 20);
          await new Promise(r => setTimeout(r, 300));
          return result;
        } catch (e) {
          clearInterval(intervalId);
          const elapsed = Math.round((performance.now() - start) / 100) / 10;
          updateStep(idx, { status: 'error', elapsed, description: String(e) });
          setProgress(prev => prev + 20);
          await new Promise(r => setTimeout(r, 300));
          throw e;
        }
      };

      try {
        // Agent 1
        const { rows, columns } = await runStep(0, () => parseCSV(file));

        // Agent 2
        const { stats, qualityScore } = await runStep(1, () => computeStats(rows, columns));

        // Agent 3
        const chartData = await runStep(2, () => prepareCharts(rows, stats));

        // Agent 4
        const anomalies = await runStep(3, () => detectAnomalies(rows, stats));

        // Agent 5
        const insights = await runStep(4, () => generateInsights(file.name, rows.length, stats));

        const featureSuggestions = generateFeatureSuggestions(stats, rows.length);

        timers.forEach(clearInterval);

        await new Promise(r => setTimeout(r, 600));

        onComplete({
          fileName: file.name,
          fileSize: file.size,
          rowCount: rows.length,
          columnCount: columns.length,
          columns: stats,
          qualityScore,
          anomalies,
          insights,
          chartData,
          featureSuggestions,
        });
      } catch {
        timers.forEach(clearInterval);
      }
    };

    run();
  }, [file, onComplete, updateStep]);

  const fileSize = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(1)} KB`
    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: 'var(--ax-bg)' }}>
      <Logo size="lg" />
      <div className="flex items-center gap-2 mt-4">
        <span className="font-mono text-sm" style={{ color: 'var(--ax-cyan)' }}>{file.name}</span>
        <span className="font-mono text-xs" style={{ color: 'var(--ax-muted)' }}>{fileSize}</span>
      </div>

      <div className="mt-6" style={{ maxWidth: 480, width: '100%' }}>
        <div className="flex justify-end mb-1">
          <span className="font-mono text-xs" style={{ color: 'var(--ax-cyan)' }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--ax-border)', borderRadius: 2 }}>
          <div
            style={{
              height: 4,
              background: 'var(--ax-cyan)',
              borderRadius: 2,
              width: `${progress}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2" style={{ maxWidth: 480, width: '100%' }}>
        {steps.map((step, i) => (
          <div
            key={step.name}
            className="ax-fadeUp flex items-center gap-3 rounded-lg p-4"
            style={{
              background: 'var(--ax-card)',
              border: '1px solid var(--ax-border)',
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <StatusIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <p className="font-syne text-sm" style={{ color: 'var(--ax-text)' }}>{step.name}</p>
              <p className="font-mono text-xs truncate" style={{ color: 'var(--ax-muted)' }}>{step.description}</p>
            </div>
            <span className="font-mono text-xs shrink-0" style={{ color: 'var(--ax-muted)' }}>
              {step.elapsed > 0 ? `${step.elapsed}s` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyzingScreen;
