import { useState } from 'react'

export default function TagEditor({ value = [], onChange }) {
  const [input, setInput] = useState('');
  function addTag() {
    const t = input.trim();
    if (!t) return;
    const next = Array.from(new Set([...(value||[]), t]));
    onChange(next); setInput('');
  }
  function removeTag(t) { onChange(value.filter(x => x !== t)); }
  return (
    <div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="輸入標籤後按新增" 
               className="flex-1 border rounded-xl px-3 py-2 text-sm"/>
        <button onClick={addTag} className="px-3 py-2 border rounded-xl">新增</button>
      </div>
      <div className="flex gap-2 flex-wrap mt-2">
        {value.map(t => (
          <span key={t} className="text-xs bg-gray-100 rounded-full px-2 py-1">#{t}
            <button onClick={()=>removeTag(t)} className="ml-1 text-gray-500">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
