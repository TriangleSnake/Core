import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/public/posts/${id}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "讀取貼文失敗")
        }
        const data = await res.json()
        if (mounted) setPost(data)
      } catch (e) {
        if (mounted) setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-6">載入中…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!post) return <div className="p-6 text-gray-500">找不到這則貼文</div>

  const goOrg = () =>
    navigate(post.orgType === "club" ? `/clubs/${post.orgUsername}` : `/companies/${post.orgUsername}`)

  const goAuthor = () => navigate(`/users/${post.authorUsername}`)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 標題 + 快速資訊 */}
      <div className="border rounded-xl p-6 bg-white shadow">
        <h1 className="text-2xl font-bold">{post.title || "未命名活動"}</h1>

        <div className="mt-2 text-gray-700 space-x-3">
          {post.event_date && <span>📅 {post.event_date}</span>}
          {post.event_location && <span>📍 {post.event_location}</span>}
          {Number.isFinite(Number(post.participants)) && (
            <span>👥 參與人數 {post.participants}</span>
          )}
          {post.budget != null && post.budget !== "" && (
            <span>💰 預算 {post.budget}</span>
          )}
        </div>

        {post.tags && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.split(",").map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 rounded px-2 py-0.5">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 內容 */}
      <div className="border rounded-xl p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">活動內容</h2>
        <div className="whitespace-pre-line text-gray-800">{post.content || "（無內容）"}</div>
      </div>

      {/* 發布者 + 組織 */}
      <div className="border rounded-xl p-6 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">發布資訊</h2>

        <div className="flex items-center gap-4">
          {/* 作者 */}
          <button onClick={goAuthor} className="flex items-center gap-3 hover:opacity-80">
            {post.authorAvatar ? (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {post.authorName ? post.authorName[0] : "?"}
              </div>
            )}
            <div className="text-left">
              <div className="font-medium">{post.authorName}</div>
              <div className="text-sm text-gray-500">@{post.authorUsername}</div>
            </div>
          </button>

          {/* 來源組織 */}
          <div className="ml-auto">
            <button
              onClick={goOrg}
              className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
            >
              來自 {post.orgName}（{post.orgType === "club" ? "社團" : "公司"}）
            </button>
          </div>
        </div>

        {/* 發布時間 */}
        <div className="text-xs text-gray-400 mt-3">
          {post.createdAt ? new Date(post.createdAt).toLocaleString("zh-TW") : ""}
        </div>

        {/* 行動按鈕 */}
        <div className="mt-4 flex gap-2">
          <button className="px-3 py-1 text-sm rounded bg-green-100 text-green-700 hover:bg-green-200">
            有興趣
          </button>
          <button className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
            洽談
          </button>
        </div>
      </div>
    </div>
  )
}
