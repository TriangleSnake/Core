import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ChatList({ currentChatId }) {
  const [chats, setChats] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chats", { credentials: "include" })
        if (res.ok) setChats(await res.json())
      } catch (e) {
        console.error("載入聊天室失敗", e)
      }
    })()
  }, [])

  return (
    <div className="border-r w-64 bg-white h-[calc(100vh-64px)] overflow-y-auto">
      <h2 className="p-4 font-bold border-b">聊天室</h2>
      <ul>
        {chats.map(chat => (
          <li
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className={`p-3 hover:bg-gray-100 cursor-pointer border-b ${
              currentChatId === chat.id ? "bg-gray-100" : ""
            }`}
          >
            <div className="font-medium">{chat.title || "未命名聊天室"}</div>
            {chat.lastMessage && (
              <div className="text-sm text-gray-500 truncate">
                {chat.lastMessage}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
