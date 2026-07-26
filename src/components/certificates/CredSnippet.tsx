interface CredSnippetProps {
  logoPath?: string;
  name: string;
  onClick: () => void;
}

export function CredSnippet({ logoPath, name, onClick }: CredSnippetProps) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer rounded-xl border flex flex-col items-center justify-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
      style={{ 
        aspectRatio: '3/4',
        backgroundColor: 'var(--ct-surface)',
        borderColor: 'var(--ct-border)'
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
      
      {logoPath ? (
        <img 
          src={logoPath} 
          alt={name} 
          className="w-20 h-20 object-contain mb-6 drop-shadow-sm group-hover:scale-105 transition-transform" 
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600 font-bold text-2xl border-4 border-white shadow-sm">
          {name.charAt(0)}
        </div>
      )}
      
      <h3 className="text-center font-display font-semibold text-lg line-clamp-3 px-2 group-hover:text-blue-600 transition-colors">
        {name}
      </h3>
    </div>
  );
}