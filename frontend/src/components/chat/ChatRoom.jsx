import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"

export default function ChatRoom() {
  const { chatId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const seen = useRef(new Set())

  // 初次載入所有訊息
  useEffect(() => {
    if (!chatId) return
    ;(async () => {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        credentials: "include",
      })
      if (res.ok) {
        const list = await res.json()
        list.forEach(m => seen.current.add(m.id))
        setMessages(list)
      }
    })()
  }, [chatId])

  // Polling 每 4 秒更新
  useEffect(() => {
    if (!chatId) return
    const interval = setInterval(async () => {
      try {
        if (messages.length === 0) return
        const lastTime = messages[messages.length - 1].createdAt
        const res = await fetch(
          `/api/chats/${chatId}/messages?since=${encodeURIComponent(lastTime)}`,
          { credentials: "include" }
        )
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
    }, 4000)
    return () => clearInterval(interval)
  }, [chatId, messages])

  async function sendMessage() {
    if (!input.trim()) return
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: input }),
    })
    if (res.ok) {
      const msg = await res.json()
      seen.current.add(msg.id)
      setMessages(prev => [...prev, msg])
      setInput("")
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className="p-2 border rounded">
            <div className="text-sm text-gray-500">
              {m.authorName} @ {new Date(m.createdAt).toLocaleString()}
            </div>
            <div>{m.body}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          發送
        </button>
      </div>
    </div>
  )
}
