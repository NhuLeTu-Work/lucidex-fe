interface BlurRevealTextProps {
  text: string;
  className?: string;
}

export function BlurRevealText({ text, className }: BlurRevealTextProps) {
  return (
    <div className={className} style={{ perspective: '1000px' }}>
      {text.split(' ').map((word, wordIndex) => (
  <span 
    key={wordIndex} 
    // Thêm pb-2 (padding-bottom) hoặc py-1 để đẩy các dòng ra xa nhau một chút khi rớt dòng
    className="inline-block whitespace-nowrap mr-[0.25em] pb-2" 
  > 
    {word.split('').map((char, charIndex) => (
      <span key={charIndex} className="inline-block animate-blur">
        {char}
      </span>
    ))}
  </span>
))}
    </div>
  );
}