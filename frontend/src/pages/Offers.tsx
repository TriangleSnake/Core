import { useState } from 'react'
import { api } from '../lib/api'

export default function Offers(){
  const [campaignId, setCampaignId] = useState('')
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState('')
  const submit = async ()=>{
    const body = { campaign_id: Number(campaignId), type: 'cash', amount_cash: Number(amount) }
    const res = await api.post('/offers', body)
    setMsg(res.id? '已投遞提案！' : (res.detail||'失敗'))
  }
  return (
    <div className="max-w-lg bg-white p-4 rounded-xl border">
      <h2 className="font-semibold mb-2">對案件提出贊助</h2>
      <input className="input" placeholder="案件 ID" value={campaignId} onChange={e=>setCampaignId(e.target.value)} />
      <input className="input mt-2" placeholder="現金金額" value={amount} onChange={e=>setAmount(e.target.value)} />
      <button className="btn mt-3" onClick={submit}>送出提案</button>
      <p className="text-sm text-gray-600 mt-2">{msg}</p>
      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}.btn{background:#111;color:#fff;border-radius:.5rem;padding:.5rem 1rem}`}</style>
    </div>
  )
}
