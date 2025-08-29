import { useNavigate } from "react-router-dom"

export default function Post({ post }) {
  const navigate = useNavigate()
  const goDetail = () => navigate(`/posts/${post.id}`)

  return (
    <div
      className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={goDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? goDetail() : null)}
    >
      {/* 活動標題 */}
      <h3 className="text-lg font-bold mb-1 line-clamp-1">{post.title || "未命名活動"}</h3>

      {/* 活動快速資訊 */}
      <div className="text-sm text-gray-600 mb-2 space-x-2">
        {post.event_date && <span>📅 {post.event_date}</span>}
        {post.event_location && <span>📍 {post.event_location}</span>}
      </div>

      {/* 簡介（節錄內容） */}
      <p className="text-gray-800 whitespace-pre-line line-clamp-3">
        {post.content || "（無內容）"}
      </p>

      {/* 標籤（可選） */}
      {post.tags && (
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 rounded px-2 py-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* 操作列 */}
      <div className="mt-3 flex items-center gap-2">
        <button
          className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: 之後串 /interest
            alert("之後會串接『有興趣』API")
          }}
        >
          有興趣
        </button>
        <button
          className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: 之後串 /chat
            alert("之後會串接『洽談』API")
          }}
        >
          洽談
        </button>

        <button
          className="ml-auto text-sm text-blue-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            alert("之後把對應 adminId/peerId 帶進 openDM；目前先跳詳情或彈出選擇對象")
          }}
        >
          看詳細 →
        </button>
      </div>
    </div>
  )
}
