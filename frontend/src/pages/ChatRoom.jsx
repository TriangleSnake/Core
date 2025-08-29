// src/pages/ChatRoom.jsx
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { getMe } from "../lib/api"

export default function ChatRoom() {
  const { chatId } = useParams()
  const [me, setMe] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const seen = useRef(new Set())   // ✅ 去重用
  const bottomRef = useRef(null)   // ✅ 自動滾動用
  useEffect(() => {
    if (!chatId) return
    const interval = setInterval(async () => {
      try {
        if (messages.length === 0) return
        const lastTime = messages[messages.length - 1].createdAt
        const res = await fetch(`/api/chats/${chatId}/messages?since=${encodeURIComponent(lastTime)}`, {
          credentials: "include"
        })
        if (res.ok) {
          const list = await res.json()
          const dedup = list.filter(m => !seen.current.has(m.id))
          if (dedup.length) {
            dedup.forEach(m => seen.current.add(m.id))
            setMessages(prev => [...prev, ...dedup])
          }
        }
      } catch (e) {
        console.error("polling failed", e)
      }
    }, 4000) // ⏱ 每 4 秒
    return () => clearInterval(interval)
  }, [chatId, messages])
  // 抓取歷史訊息
  useEffect(() => {
    let abort = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, { credentials: "include" })
        if (res.ok) {
          const list = await res.json()
          if (!abort) {
            const dedup = list.filter(m => !seen.current.has(m.id))
            dedup.forEach(m => seen.current.add(m.id))
            setMessages(dedup)
          }
        }
        const meData = await getMe()
        setMe(meData)
      } catch (err) {
        console.error("載入訊息失敗", err)
      } finally {
        if (!abort) setLoading(false)
      }
    })()
    return () => { abort = true }
  }, [chatId])

  // 滾動到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: input })
      })
      if (res.ok) {
        const msg = await res.json()
        if (!seen.current.has(msg.id)) {
          seen.current.add(msg.id)
          setMessages(prev => [...prev, msg])
        }
        setInput("")
      } else {
        const err = await res.json()
        alert("送出失敗：" + err.error)
      }
    } catch (err) {
      alert("伺服器錯誤：" + err.message)
    }
  }

  if (loading) return <div className="p-6">載入中...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto border rounded-lg bg-white shadow">
      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm">尚無訊息</div>
        ) : (
          messages.map(m => {
            const mine = me && m.authorUsername === me.username
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${mine ? "justify-end" : ""}`}
              >
                {!mine && (
                  m.authorAvatar ? (
                    <img
                      src={m.authorAvatar}
                      alt={m.authorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      {m.authorName ? m.authorName[0] : "?"}
                    </div>
                  )
                )}
                <div className={`max-w-xs p-2 rounded-lg ${mine ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                  {!mine && (
                    <div className="text-xs font-semibold mb-0.5">{m.authorName}</div>
                  )}
                  <div>{m.body}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(m.createdAt).toLocaleString("zh-TW")}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <form onSubmit={sendMessage} className="border-t p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="輸入訊息..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          送出
        </button>
      </form>
    </div>
  )
}
