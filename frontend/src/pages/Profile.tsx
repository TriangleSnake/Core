import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Profile(){
  const [me, setMe] = useState<any>(null)
  useEffect(()=>{ (async()=>{ setMe(await api.get('/auth/me')) })() },[])
  if(!me || me.detail) return <p>尚未登入</p>
  return (
    <div className="bg-white p-4 rounded-xl border">
      <h2 className="font-semibold mb-1">{me.name}</h2>
      <p className="text-sm text-gray-600">{me.email} · {me.role}</p>
    </div>
  )
}
