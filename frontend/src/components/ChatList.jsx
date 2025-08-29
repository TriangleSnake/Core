import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ChatList({ onClose }) {
  const [chats, setChats] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/chats", { credentials: "include" })
        if (res.ok) {
          setChats(await res.json())
        }
      } catch (err) {
        console.error("載入聊天室失敗", err)
      }
    })()
  }, [])

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
      <div className="p-3 border-b font-semibold text-gray-700">聊天室</div>
      {chats.length === 0 ? (
        <div className="p-3 text-gray-500 text-sm">尚無聊天室</div>
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => {
                navigate(`/chat/${chat.id}`)
                onClose?.()
              }}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b"
            >
              <div className="font-medium">{chat.title || "聊天室"}</div>
              {chat.lastMessage && (
                <div className="text-xs text-gray-500 truncate">
                  {chat.lastMessage}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
