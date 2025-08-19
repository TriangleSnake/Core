import { useState } from 'react'
import { api } from '../lib/api'

export default function NewCampaign(){
  const [form, setForm] = useState({title:'', description:'', budget_min:'', budget_max:''})
  const [msg, setMsg] = useState('')
  const submit = async ()=>{
    const payload = { ...form, budget_min: Number(form.budget_min)||null, budget_max: Number(form.budget_max)||null }
    const res = await api.post('/campaigns', payload)
    setMsg(res.id? '建立成功！' : (res.detail||'失敗'))
  }
  const set = (k:string,v:string)=> setForm(prev=>({...prev,[k]:v}))
  return (
    <div className="max-w-xl bg-white p-4 rounded-xl border">
      <h2 className="font-semibold mb-2">發佈案件</h2>
      <input className="input" placeholder="標題" value={form.title} onChange={e=>set('title', e.target.value)} />
      <textarea className="input mt-2" placeholder="需求描述（活動資訊、曝光資源、期望贊助）" rows={5} value={form.description} onChange={e=>set('description', e.target.value)} />
      <div className="grid grid-cols-2 gap-2 mt-2">
        <input className="input" placeholder="最低預算" value={form.budget_min} onChange={e=>set('budget_min', e.target.value)} />
        <input className="input" placeholder="最高預算" value={form.budget_max} onChange={e=>set('budget_max', e.target.value)} />
      </div>
      <button className="btn mt-3" onClick={submit}>送出</button>
      <p className="text-sm text-gray-600 mt-2">{msg}</p>
      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}.btn{background:#111;color:#fff;border-radius:.5rem;padding:.5rem 1rem}`}</style>
    </div>
  )
}
