import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import ChatList from "./ChatList"

export default function Banner() {
  const [me, setMe] = useState(null)
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const chatRef = useRef()

  // 捲動時加上透明背景
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  // 抓取當前登入者
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" })
        if (res.ok) setMe(await res.json())
      } catch (err) {
        console.error("載入使用者失敗", err)
      }
    })()
  }, [])

  // 點擊外部關閉 ChatList
  useEffect(() => {
    function handleClickOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setOpenChat(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    location.reload()
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300
        ${scrolled
          ? "bg-white/70 backdrop-blur-md shadow border-b"
          : "bg-white border-b shadow"}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          TriSystem
        </div>

        {/* 右上角功能區 */}
        <div className="flex items-center gap-4 relative" ref={chatRef}>
          {/* 💬 Chat icon */}
          <button
            onClick={() => setOpenChat(!openChat)}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            💬
          </button>
          {openChat && <ChatList onClose={() => setOpenChat(false)} />}

          {me ? (
            <>
              <button
                onClick={() => navigate(`/users/${me.username}`)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {me.avatar ? (
                  <img
                    src={me.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-700">
                    {me.name ? me.name[0] : "?"}
                  </div>
                )}
                <span className="text-blue-600">{me.username || me.name}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                登出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                登入
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                註冊
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
