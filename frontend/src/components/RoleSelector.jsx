import { cls } from '../utils/cls'

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 mb-3">
      {['廠商','社團'].map(t => (
        <button
          key={t}
          type="button"
          onClick={()=>onChange(t)}
          className={cls(
            "px-3 py-1.5 text-sm rounded-xl border",
            value===t ? "bg-black text-white" : "bg-white hover:bg-gray-50"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
