import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import AvatarEditor from "../components/AvatarEditor"
import Post from "../components/Post"
import { getMe } from "../lib/api"

export default function UserProfile() {
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [orgs, setOrgs] = useState({ clubs: [], companies: [] })
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState(null)   // 當前登入者
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    (async () => {
      try {
        // 公開使用者資料
        const resUser = await fetch(`/api/public/users/${username}`)
        if (resUser.ok) {
          const u = await resUser.json()
          setUser(u)
          setForm(u) // 初始化編輯表單
        }

        // 頭貼
        const resAvatar = await fetch(`/api/users/${username}/avatar`)
        if (resAvatar.ok) {
          const data = await resAvatar.json()
          setAvatar(data.avatar || null)
        }

        // 組織
        const resOrgs = await fetch(`/api/public/users/${username}/orgs`)
        if (resOrgs.ok) setOrgs(await resOrgs.json())

        // 貼文
        const resPosts = await fetch(`/api/public/users/${username}/posts`)
        if (resPosts.ok) setPosts(await resPosts.json())

        // 當前登入者
        const meData = await getMe()
        setMe(meData)
      } catch (err) {
        console.error("載入使用者資料失敗", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [username])

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data)
        setEditing(false)
      } else {
        alert("更新失敗：" + data.error)
      }
    } catch (err) {
      alert("伺服器錯誤：" + err.message)
    }
  }

  if (loading) return <div className="p-6">載入中...</div>
  if (!user) return <div className="p-6 text-red-500">找不到使用者</div>

  const isOwner = me && me.username === user.username

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 使用者基本資料 */}
      <div className="border rounded-lg p-6 bg-white shadow flex gap-6 items-center">
        <AvatarEditor
          initialAvatar={avatar}
          fallbackLetter={user.name ? user.name[0] : "?"}
          uploadUrl={`/api/users/${username}/avatar`}
          editable={isOwner}
        />

        <div className="flex-1">
          {editing ? (
            <>
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="border rounded px-2 py-1 w-full mb-2"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 text-white rounded mr-2"
              >
                儲存
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-700">{user.email}</p>
              {user.phone && <p className="text-gray-700">{user.phone}</p>}
              <p className="text-gray-500 text-sm mt-2">
                註冊時間：
                {user.created_at ? new Date(user.created_at).toLocaleString() : "未知"}
              </p>
              {isOwner && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 px-3 py-1 bg-blue-500 text-white rounded"
                >
                  編輯 Profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 社團 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">加入的社團</h2>
        {orgs.clubs.length === 0 ? (
          <p className="text-gray-500">尚未加入任何社團</p>
        ) : (
          <ul className="space-y-2">
            {orgs.clubs.map((c) => (
              <li key={c.username} className="flex items-center gap-3 p-3 border rounded">
                {c.avatar ? (
                  <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {c.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{c.name}</div>
                  {c.school && <div className="text-sm text-gray-500">{c.school}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 公司 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">加入的公司</h2>
        {orgs.companies.length === 0 ? (
          <p className="text-gray-500">尚未加入任何公司</p>
        ) : (
          <ul className="space-y-2">
            {orgs.companies.map((co) => (
              <li key={co.username} className="flex items-center gap-3 p-3 border rounded">
                {co.avatar ? (
                  <img src={co.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {co.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{co.name}</div>
                  {co.businessNo && (
                    <div className="text-sm text-gray-500">統編：{co.businessNo}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 貼文 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">發表的貼文</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">尚未發表任何貼文</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <Post key={p.id} post={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
