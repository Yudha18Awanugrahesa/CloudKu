const TONES = {
  good: 'bg-primary-soft text-primary',
  warn: 'bg-accent-soft text-accent',
  bad: 'bg-danger-soft text-danger',
  neutral: 'bg-gray-100 text-gray-500',
};
export default function Badge({ text, tone = 'neutral' }) {
  return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${TONES[tone]}`}>{text}</span>;
}
