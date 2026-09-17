export default function SummaryCard({ label, value, icon: Icon, hero, tone }) {
  if (hero) {
    return (
      <div className="bg-primary rounded-2xl p-5 text-white col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold opacity-85">{label}</span>
          {Icon && <Icon size={18} className="opacity-85" />}
        </div>
        <div className="text-2xl font-extrabold mt-2 tracking-tight">{value}</div>
      </div>
    );
  }
  const barColor = tone === 'bad' ? 'bg-danger' : tone === 'good' ? 'bg-primary' : 'bg-accent';
  const textColor = tone === 'bad' ? 'text-danger' : tone === 'good' ? 'text-primary' : 'text-accent';
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} />
      <div className="flex items-center justify-between ml-1">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        {Icon && <Icon size={16} className={textColor} />}
      </div>
      <div className="text-lg font-extrabold mt-1.5 ml-1">{value}</div>
    </div>
  );
}
