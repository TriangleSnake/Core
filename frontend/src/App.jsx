import { Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import Banner from "./components/Banner"
import Sidebar from "./components/Sidebar"

import Roster from "./pages/Roster"
import Register from "./pages/Register"
import Login from "./pages/Login"
import NewOrg from "./pages/NewOrg"

import { getMe, logout } from "./lib/api"

export default function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [orgs, setOrgs] = useState([])

  useEffect(() => {
    getMe().then(res => {
      if (res) setUser(res)
    })
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Banner
        user={user}
        onLoginClick={() => setAuthMode("login")}
        onLogout={handleLogout}
      />

      {user && (
        <Sidebar
          orgs={orgs}
          onAddOrg={() => navigate("/orgs/new")}
        />
      )}

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Roster />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
          <Route path="/orgs/new" element={<NewOrg user={user}/>} />
        </Routes>
      </main>

      {authMode === "login" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Login onLogin={(u) => { setUser(u); setAuthMode(null) }} />
            <button
              onClick={() => setAuthMode(null)}
              className="mt-4 text-gray-500 underline block mx-auto"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
