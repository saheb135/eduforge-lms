export default function LoadingSpinner({ size = 'lg', text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className={`${size === 'lg' ? 'w-16 h-16' : 'w-8 h-8'} rounded-full border-4 border-slate-700`} />
          <div
            className={`absolute inset-0 ${size === 'lg' ? 'w-16 h-16' : 'w-8 h-8'} rounded-full border-4 border-transparent border-t-sky-500 animate-spin`}
          />
        </div>
        {text && <p className="text-slate-400 font-body text-sm">{text}</p>}
      </div>
    </div>
  );
}
