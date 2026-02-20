import { RefreshCw } from 'lucide-react';
import Logo from '../Logo';

interface NavbarProps {
  fileName: string;
  rowCount: number;
  onReset: () => void;
}

const Navbar = ({ fileName, rowCount, onReset }: NavbarProps) => (
  <nav
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
    style={{
      height: 60,
      background: 'var(--ax-card-alt)',
      borderBottom: '1px solid var(--ax-border)',
    }}
  >
    <Logo size="sm" />
    <div className="font-mono text-sm">
      <span style={{ color: 'var(--ax-cyan)' }}>{fileName}</span>
      <span style={{ color: 'var(--ax-muted)' }}> · {rowCount.toLocaleString()} rows</span>
    </div>
    <button
      onClick={onReset}
      className="flex items-center gap-2 font-syne text-xs font-bold rounded-lg px-4 py-2 transition-opacity hover:opacity-80 cursor-pointer"
      style={{
        background: 'var(--ax-amber)',
        color: 'var(--ax-bg)',
      }}
    >
      <RefreshCw size={14} />
      New Analysis
    </button>
  </nav>
);

export default Navbar;
