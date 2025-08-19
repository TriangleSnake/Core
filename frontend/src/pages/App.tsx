import { Outlet, Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useState } from 'react'

export default function App(){
  const nav = useNavigate()
  const [_, force] = useState(0)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="font-bold">CampusSponsorship</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/campaigns">案件市集</Link>
            <Link to="/offers">我的提案</Link>
            <Link to="/profile">我的帳戶</Link>
          </nav>
          <div className="ml-auto flex gap-2">
            <Link to="/login" className="px-3 py-1 rounded bg-black text-white text-sm">登入</Link>
            <button onClick={()=>{api.setToken(''); force(x=>x+1); nav('/')}} className="px-3 py-1 rounded border text-sm">登出</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet/>
      </main>
    </div>
  )
}
