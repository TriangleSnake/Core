import { Routes, Route, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Banner from "./components/Banner"
import Sidebar from "./components/Sidebar"

import Roster from "./pages/Roster"
import Register from "./pages/Register"
import Login from "./pages/Login"
import NewOrg from "./pages/NewOrg"
import PostDetail from "./pages/PostDetail"
import UserProfile from "./pages/UserProfile"
import ClubProfile from "./pages/ClubProfile"
import CompanyProfile from "./pages/CompanyProfile"
import ChatPage from "./pages/ChatPage"
import { getMe, logout } from "./lib/api"


export default function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState(null)
  const [orgs, setOrgs] = useState([])
  const navigate = useNavigate()

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

      <main className="max-w-6xl mx-auto p-4 pt-20">
        <Routes>
          <Route path="/" element={<Roster />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
          <Route path="/orgs/new" element={<NewOrg user={user}/>} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/users/:username" element={<UserProfile />} />
          <Route path="/club/:username" element={<ClubProfile />} />
          <Route path="/company/:username" element={<CompanyProfile />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
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
