interface LogoProps {
  size?: 'sm' | 'lg';
}

const Logo = ({ size = 'sm' }: LogoProps) => {
  const isLg = size === 'lg';
  const textSize = isLg ? 'text-4xl' : 'text-lg';
  const hexSize = isLg ? 24 : 16;
  const dotSize = isLg ? 9 : 7;

  return (
    <div className="flex items-center gap-2">
      <svg width={hexSize} height={hexSize} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" fill="#00F5FF" opacity="0.9" />
      </svg>
      <span className={`font-syne font-bold ${textSize}`}>
        <span style={{ color: '#E8EDF5' }}>Analyt</span>
        <span style={{ color: '#00F5FF' }}>iX</span>
      </span>
      <span
        className="ax-pulse rounded-full inline-block"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: '#00F5FF',
          boxShadow: '0 0 10px rgba(0,245,255,0.5)',
        }}
      />
    </div>
  );
};

export default Logo;
