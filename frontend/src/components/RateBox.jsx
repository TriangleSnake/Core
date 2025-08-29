import { cls } from '../utils/cls'

export default function RateBox({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={()=>onChange(n)} 
          className={cls('text-2xl leading-none', n <= value ? 'text-black' : 'text-gray-300')} 
          aria-label={`${n} 星`}>
          ★
        </button>
      ))}
    </div>
  );
}
