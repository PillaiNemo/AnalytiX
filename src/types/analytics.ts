export type ColumnType = 'number' | 'string' | 'date';

export interface ColumnStats {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPercent: number;
  uniqueCount: number;
  topValues: { value: string; count: number }[];
  // numeric only
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  skewness?: number;
}

export interface Anomaly {
  rowIndex: number;
  column: string;
  value: number;
  zScore: number;
  severity: 'mild' | 'severe';
}

export interface Insight {
  title: string;
  finding: string;
  recommendation: string;
  confidence: number;
}

export interface FeatureSuggestion {
  column: string;
  suggestion: string;
}

export interface ChartData {
  distribution: { range: string; count: number }[];
  distributionCol: string;
  completeness: { name: string; nullPercent: number }[];
  topValues: { value: string; count: number }[];
  topValuesCol: string;
  scatter: { x: number; y: number }[] | null;
  scatterColX: string;
  scatterColY: string;
  fallbackUniqueChart: { name: string; uniqueCount: number }[] | null;
}

export interface DatasetProfile {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnStats[];
  qualityScore: number;
  anomalies: Anomaly[];
  insights: Insight[] | null;
  chartData: ChartData;
  featureSuggestions: FeatureSuggestion[];
}

export type AgentStatus = 'pending' | 'active' | 'complete' | 'error';

export interface AgentStep {
  name: string;
  description: string;
  status: AgentStatus;
  elapsed: number;
}

export type AppScreen = 'upload' | 'analyzing' | 'results';
