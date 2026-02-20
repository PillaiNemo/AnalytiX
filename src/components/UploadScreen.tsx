import { useCallback, useState, useRef } from 'react';
import { UploadCloud, Sparkles, ShieldAlert, BarChart2 } from 'lucide-react';
import Logo from './Logo';

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
}

const UploadScreen = ({ onFileSelect }: UploadScreenProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File) => {
    setError('');
    if (!file.name.endsWith('.csv')) {
      setError('Invalid file type. Please upload a CSV file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validate(file);
  }, [validate]);

  const pills = [
    { icon: Sparkles, label: 'AI-Powered Insights' },
    { icon: ShieldAlert, label: 'Anomaly Detection' },
    { icon: BarChart2, label: 'Auto Visualization' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: 'var(--ax-bg)' }}>
      <Logo size="lg" />
      <p className="font-syne text-sm mt-2" style={{ color: 'var(--ax-muted)' }}>
        Autonomous Data Intelligence Platform
      </p>

      <div
        className="mt-10 flex flex-col items-center rounded-xl px-10 py-12 transition-all duration-200"
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'var(--ax-card)',
          border: isDragging ? '2px solid var(--ax-cyan)' : '2px dashed var(--ax-border)',
          borderRadius: 12,
          backgroundColor: isDragging ? 'rgba(0,245,255,0.03)' : 'var(--ax-card)',
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <UploadCloud size={48} style={{ color: 'var(--ax-cyan)' }} />
        <p className="font-syne text-base mt-4 text-center" style={{ color: 'var(--ax-text)' }}>
          Drop your CSV file to begin analysis
        </p>
        <p className="font-syne text-xs mt-2 text-center" style={{ color: 'var(--ax-muted)' }}>
          Supports CSV files up to 50MB
        </p>
        <button
          className="mt-5 font-syne text-sm px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{
            border: '1px solid var(--ax-cyan)',
            color: 'var(--ax-cyan)',
            background: 'transparent',
          }}
          onClick={() => inputRef.current?.click()}
        >
          Browse File
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validate(file);
          }}
        />
      </div>

      {error && (
        <p className="font-syne text-sm mt-4" style={{ color: 'var(--ax-red)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-8 flex-wrap justify-center">
        {pills.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-full px-4 py-2 font-syne text-xs"
            style={{
              border: '1px solid var(--ax-border)',
              background: 'var(--ax-card)',
              color: 'var(--ax-muted)',
            }}
          >
            <Icon size={14} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadScreen;
