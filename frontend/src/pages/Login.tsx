import { useState } from 'react'
import { api } from '../lib/api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async () => {
    const data = await api.post('/auth/login', { email, password })
    if(data.access_token){ api.setToken(data.access_token); setMsg('登入成功') }
    else setMsg(data.detail || '登入失敗')
  }

  return (
    <div className="max-w-sm bg-white p-4 rounded-xl border">
      <h2 className="font-semibold mb-2">登入</h2>
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="input mt-2" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="btn mt-3" onClick={submit}>登入</button>
      <p className="text-sm text-gray-600 mt-2">{msg}</p>
      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}.btn{width:100%;background:#111;color:#fff;border-radius:.5rem;padding:.5rem}`}</style>
    </div>
  )
}
