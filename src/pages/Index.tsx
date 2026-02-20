import { useState, useCallback } from 'react';
import type { DatasetProfile, AppScreen } from '@/types/analytics';
import UploadScreen from '@/components/UploadScreen';
import AnalyzingScreen from '@/components/AnalyzingScreen';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [screen, setScreen] = useState<AppScreen>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setScreen('analyzing');
  }, []);

  const handleComplete = useCallback((p: DatasetProfile) => {
    setProfile(p);
    setScreen('results');
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setProfile(null);
    setScreen('upload');
  }, []);

  switch (screen) {
    case 'upload':
      return <UploadScreen onFileSelect={handleFileSelect} />;
    case 'analyzing':
      return file ? <AnalyzingScreen file={file} onComplete={handleComplete} /> : null;
    case 'results':
      return profile ? <Dashboard profile={profile} onReset={handleReset} /> : null;
  }
};

export default Index;
