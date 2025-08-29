import { cls } from '../utils/cls'

export default function Stars({ value = 0, small = false }) {
  const full = Math.round(value * 2) / 2;
  const size = small ? 'text-xs' : 'text-sm';
  const items = [1,2,3,4,5].map(i => {
    const diff = full - i;
    const ch = diff >= 0 ? '★' : (diff === -0.5 ? '⯪' : '☆');
    return <span key={i} className={cls(size)}>{ch}</span>;
  });
  return <span className="inline-flex items-center gap-0.5" title={`${value.toFixed(2)} / 5`}>{items}</span>;
}
