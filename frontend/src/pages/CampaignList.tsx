import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function CampaignList(){
  const [list, setList] = useState<any[]>([])
  const [q, setQ] = useState('')
  useEffect(()=>{ (async()=>{ setList(await api.get('/campaigns')) })() },[])
  const search = async ()=> setList(await api.get('/campaigns?q='+encodeURIComponent(q)))
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="搜尋案件" value={q} onChange={e=>setQ(e.target.value)}/>
        <button className="btn" onClick={search}>搜尋</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(item=> (
          <div key={item.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{item.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{item.category||'一般'}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            <div className="text-sm text-gray-500 mt-2">預算 {item.budget_min||'-'} ~ {item.budget_max||'-'}</div>
          </div>
        ))}
      </div>
      <style>{`.input{flex:1;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}.btn{background:#111;color:#fff;border-radius:.5rem;padding:.5rem 1rem}`}</style>
    </div>
  )
}
