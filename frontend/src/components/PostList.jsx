import { useEffect, useState } from "react"
import { getMe } from "../lib/api"

export default function PostList({ fetchUrl, postUrl }) {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const [me, setMe] = useState(null)

  // 載入現有貼文 & 使用者
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(fetchUrl, { credentials: "include" })
        if (res.ok) {
          setPosts(await res.json())
        }
      } catch (err) {
        console.error("載入貼文失敗", err)
      }
      const meData = await getMe()
      setMe(meData)
    })()
  }, [fetchUrl])

  // 新增貼文
  async function handleAddPost(e) {
    e.preventDefault()
    if (!newPost.trim()) return
    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newPost }),
      })
      if (res.ok) {
        const post = await res.json()
        setPosts([post, ...posts])
        setNewPost("")
      }
    } catch (err) {
      console.error("新增貼文失敗", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* 新增貼文區（只有登入時顯示） */}
      {me && (
        <form
          onSubmit={handleAddPost}
          className="border rounded-lg p-4 bg-white shadow space-y-3"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="寫下一則貼文..."
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            發布
          </button>
        </form>
      )}

      {/* 貼文列表 */}
      {posts.length === 0 ? (
        <p className="text-gray-500">尚無貼文</p>
      ) : (
        posts.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <div className="text-sm text-gray-500 mb-2">
              {p.authorName} (@{p.authorUsername}) ·{" "}
              {new Date(p.created_at).toLocaleString()}
            </div>
            <div className="text-gray-800 whitespace-pre-line">
              {p.content}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
