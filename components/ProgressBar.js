export default function ProgressBar({ pct, color = '#12523F' }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: p + '%', background: color }} />
    </div>
  );
}
