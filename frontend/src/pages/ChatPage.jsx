import ChatList from "../components/chat/ChatList"
import ChatRoom from "../components/chat/ChatRoom"
import { useParams } from "react-router-dom"

export default function ChatPage() {
  const { chatId } = useParams()
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ChatList currentChatId={chatId} />
      <ChatRoom />
    </div>
  )
}
