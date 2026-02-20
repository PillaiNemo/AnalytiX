import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell,
} from 'recharts';
import type { ChartData } from '@/types/analytics';

interface ChartSectionProps {
  chartData: ChartData;
}

const chartTooltipStyle = {
  contentStyle: {
    background: '#0F1629',
    border: '1px solid #1E2D4A',
    borderRadius: 6,
  },
  labelStyle: { color: '#E8EDF5', fontFamily: 'Syne', fontSize: 12 },
  itemStyle: { color: '#00F5FF', fontFamily: 'JetBrains Mono', fontSize: 11 },
};

const axisProps = {
  stroke: '#5A7090',
  tick: { fill: '#5A7090', fontSize: 10, fontFamily: 'JetBrains Mono' },
};

const Badge = ({ label }: { label: string }) => (
  <span
    className="font-syne text-[10px] font-semibold px-2 py-0.5 rounded"
    style={{ background: 'rgba(90,112,144,0.15)', border: '1px solid var(--ax-border)', color: 'var(--ax-muted)' }}
  >
    {label}
  </span>
);

const ChartSection = ({ chartData }: ChartSectionProps) => {
  const completenessColors = useMemo(() =>
    chartData.completeness.map(c =>
      c.nullPercent < 5 ? '#00FF88' : c.nullPercent <= 15 ? '#FFB800' : '#FF4560'
    ), [chartData.completeness]);

  const charts = [
    {
      title: `${chartData.distributionCol} Distribution`,
      badge: 'Histogram',
      render: () => chartData.distribution.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="range" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="count" fill="#00F5FF" opacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyChart />,
    },
    {
      title: 'Data Completeness by Column',
      badge: 'Completeness',
      render: () => (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.completeness}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis domain={[0, 100]} {...axisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="nullPercent" radius={[4, 4, 0, 0]}>
              {chartData.completeness.map((_, i) => (
                <Cell key={i} fill={completenessColors[i]} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: `Top Values — ${chartData.topValuesCol}`,
      badge: 'Frequency',
      render: () => chartData.topValues.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.topValues}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="value" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="count" fill="#FFB800" opacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyChart />,
    },
    {
      title: chartData.scatter ? `${chartData.scatterColX} vs ${chartData.scatterColY}` : 'Unique Values per Column',
      badge: chartData.scatter ? 'Scatter' : 'Bar',
      render: () => chartData.scatter ? (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="x" name={chartData.scatterColX} {...axisProps} />
            <YAxis dataKey="y" name={chartData.scatterColY} {...axisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Scatter data={chartData.scatter} fill="#00F5FF" opacity={0.5}>
              {chartData.scatter!.map((_, i) => <Cell key={i} r={3} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      ) : chartData.fallbackUniqueChart ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.fallbackUniqueChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Bar dataKey="uniqueCount" fill="#00F5FF" opacity={0.85} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyChart />,
    },
  ];

  return (
    <div
      className="ax-fadeUp rounded-lg overflow-hidden"
      style={{
        background: 'var(--ax-card)',
        border: '1px solid var(--ax-border)',
        animationDelay: '0.7s',
      }}
    >
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--ax-border)' }}>
        <h2 className="font-syne text-sm font-bold" style={{ color: 'var(--ax-text)' }}>Automated Visual Analysis</h2>
        <span className="font-mono text-xs" style={{ color: 'var(--ax-muted)' }}>4 visualizations generated</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {charts.map(chart => (
          <div key={chart.title} className="rounded-lg p-4" style={{ background: 'var(--ax-card-alt)', border: '1px solid var(--ax-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-syne text-sm" style={{ color: 'var(--ax-text)' }}>{chart.title}</span>
              <Badge label={chart.badge} />
            </div>
            {chart.render()}
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart = () => (
  <div className="flex items-center justify-center" style={{ height: 200, color: 'var(--ax-muted)' }}>
    <span className="font-syne text-xs">No data available</span>
  </div>
);

export default ChartSection;
