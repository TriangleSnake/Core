import { useState } from 'react'
import { api } from '../lib/api'

export default function Reviews(){
  const [targetId, setTargetId] = useState('')
  const [reviews, setReviews] = useState<any[]>([])
  const [avg, setAvg] = useState<number|null>(null)
  const [toUserId, setToUserId] = useState('')
  const [matchId, setMatchId] = useState('')
  const [rating, setRating] = useState('5')
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')

  const load = async ()=>{
    const res = await api.get('/reviews?user_id='+targetId)
    setReviews(res.reviews||[])
    setAvg(res.avg_rating||null)
  }

  const submit = async ()=>{
    const body = { to_user_id: Number(toUserId), match_id: Number(matchId), rating: Number(rating), content }
    const res = await api.post('/reviews', body)
    setMsg(res.id? '已送出評價！' : (res.detail||'失敗'))
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white p-4 rounded-xl border mb-4">
        <h2 className="font-semibold mb-2">查看評價</h2>
        <div className="flex gap-2">
          <input className="input" placeholder="使用者 ID" value={targetId} onChange={e=>setTargetId(e.target.value)}/>
          <button className="btn" onClick={load}>載入</button>
        </div>
        {avg!==null && <p className="text-sm text-gray-600 mt-2">平均評分：{avg}</p>}
        <ul className="mt-3 space-y-2">
          {reviews.map((r,i)=>(
            <li key={i} className="border rounded p-2"><span className="font-semibold">{r.rating}</span> - {r.content}</li>
          ))}
        </ul>
      </div>
      <div className="bg-white p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">撰寫評價</h2>
        <input className="input" placeholder="對象使用者 ID" value={toUserId} onChange={e=>setToUserId(e.target.value)}/>
        <input className="input mt-2" placeholder="Match ID" value={matchId} onChange={e=>setMatchId(e.target.value)}/>
        <input className="input mt-2" placeholder="評分 1-5" value={rating} onChange={e=>setRating(e.target.value)}/>
        <textarea className="input mt-2" placeholder="內容" value={content} onChange={e=>setContent(e.target.value)}/>
        <button className="btn mt-3" onClick={submit}>送出</button>
        <p className="text-sm text-gray-600 mt-2">{msg}</p>
      </div>
      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}.btn{background:#111;color:#fff;border-radius:.5rem;padding:.5rem 1rem}`}</style>
    </div>
  )
}
