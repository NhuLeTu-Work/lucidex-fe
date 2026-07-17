interface BlurRevealTextProps {
  text: string;
  className?: string;
}

export function BlurRevealText({ text, className }: BlurRevealTextProps) {
  return (
    <div className={className} style={{ perspective: '1000px' }}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block"
          style={{
            whiteSpace: char === ' ' ? 'pre' : undefined,
            animation: `blurReveal 0.6s cubic-bezier(0.2, 1, 0.2, 1) ${index * 0.02}s both`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}