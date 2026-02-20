import type { DatasetProfile } from '@/types/analytics';
import Navbar from './dashboard/Navbar';
import StatCards from './dashboard/StatCards';
import SchemaTable from './dashboard/SchemaTable';
import ChartSection from './dashboard/ChartSection';
import AnomalySection from './dashboard/AnomalySection';
import InsightsSection from './dashboard/InsightsSection';
import FeatureEngineering from './dashboard/FeatureEngineering';
import AnalysisComplete from './dashboard/AnalysisComplete';

interface DashboardProps {
  profile: DatasetProfile;
  onReset: () => void;
}

const Dashboard = ({ profile, onReset }: DashboardProps) => (
  <div style={{ background: 'var(--ax-bg)', minHeight: '100vh' }}>
    <Navbar fileName={profile.fileName} rowCount={profile.rowCount} onReset={onReset} />
    <main className="flex flex-col gap-5 px-6 pb-10" style={{ marginTop: 84 }}>
      <StatCards
        rowCount={profile.rowCount}
        columnCount={profile.columnCount}
        qualityScore={profile.qualityScore}
        anomalyCount={profile.anomalies.length}
      />
      <SchemaTable columns={profile.columns} />
      <ChartSection chartData={profile.chartData} />
      <AnomalySection anomalies={profile.anomalies} totalRows={profile.rowCount} />
      <InsightsSection insights={profile.insights} />
      <FeatureEngineering suggestions={profile.featureSuggestions} />
      <AnalysisComplete profile={profile} />
    </main>
  </div>
);

export default Dashboard;
