// src/pages/ClubProfile.jsx
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import AvatarEditor from "../components/AvatarEditor"
import Post from "../components/Post"
import NewPostForm from "../components/NewPostForm"
import MemberList from "../components/MemberList"
import { getMe, openOrgChat } from "../lib/api"

export default function ClubProfile() {
  const { username } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [members, setMembers] = useState([])
  const [posts, setPosts] = useState([])

  const [me, setMe] = useState(null)         // 當前登入者
  const [role, setRole] = useState(null)     // 我在此社團的角色（owner/member/null）

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  // 洽談身份（UI 顯示用）
  const [identities, setIdentities] = useState([])
  const [selectedIdentity, setSelectedIdentity] = useState({ type: "user", value: "me" })

  // 載入社團基本資料、頭貼、成員、貼文、我的角色
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)

        // 社團資料
        const resClub = await fetch(`/api/clubs/${username}`, { credentials: "include" })
        if (resClub.ok) {
          const c = await resClub.json()
          if (!mounted) return
          setClub(c)
          setForm(c)
        }

        // 頭貼
        const resAvatar = await fetch(`/api/clubs/${username}/avatar`)
        if (resAvatar.ok) {
          const data = await resAvatar.json()
          if (!mounted) return
          setAvatar(data.avatar || null)
        }

        // 成員
        const resMembers = await fetch(`/api/clubs/${username}/members`)
        if (resMembers.ok) {
          const list = await resMembers.json()
          if (!mounted) return
          setMembers(list)
        }

        // 貼文
        const resPosts = await fetch(`/api/clubs/${username}/posts`)
        if (resPosts.ok) {
          const p = await resPosts.json()
          if (!mounted) return
          setPosts(p)
        }

        // 當前登入者
        const meData = await getMe()
        if (mounted) setMe(meData)

        // 我在此社團的角色
        if (meData) {
          const resRole = await fetch(`/api/clubs/${username}/role`, { credentials: "include" })
          if (resRole.ok) {
            const data = await resRole.json()
            if (mounted) setRole(data.role) // 'owner' | 'member' | null
          }
        }

        // 身分下拉（以個人／代表我加入的組織）
        if (meData) {
          const resOrgs = await fetch("/api/me/orgs", { credentials: "include" })
          if (resOrgs.ok) {
            const data = await resOrgs.json()
            if (!mounted) return
            const opts = [
              { type: "user", label: "以個人身分", value: "me" },
              ...data.companies.map(co => ({ type: "company", label: `代表公司：${co.name}`, value: co.username })),
              ...data.clubs.map(c => ({ type: "club", label: `代表社團：${c.name}`, value: c.username })),
            ]
            setIdentities(opts)
            setSelectedIdentity(opts[0] || { type: "user", value: "me" })
          } else {
            // 未登入也給個預設
            setIdentities([{ type: "user", label: "以個人身分", value: "me" }])
            setSelectedIdentity({ type: "user", value: "me" })
          }
        } else {
          // 未登入也給個預設
          setIdentities([{ type: "user", label: "以個人身分", value: "me" }])
          setSelectedIdentity({ type: "user", value: "me" })
        }
      } catch (err) {
        console.error("載入社團資料失敗", err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [username])

  const isOwner = role === "owner"

  async function handleSave() {
    try {
      const res = await fetch(`/api/clubs/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name ?? "",
          school: form.school ?? "",
          info: form.info ?? "",
          activity: form.activity ?? ""
        })
      })
      const data = await res.json()
      if (res.ok) {
        setClub(data)
        setEditing(false)
      } else {
        alert("更新失敗：" + (data.error || "未知錯誤"))
      }
    } catch (err) {
      alert("伺服器錯誤：" + err.message)
    }
  }

  async function handleChat() {
    try {
      // 目前 openOrgChat 只需要 orgType / orgUsername
      const { id } = await openOrgChat({ orgType: "club", orgUsername: username })
      navigate(`/chat/${id}`)
    } catch (e) {
      alert(e.message || "開啟聊天室失敗")
    }
  }

  if (loading) return <div className="p-6">載入中...</div>
  if (!club) return <div className="p-6 text-red-500">找不到社團</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 基本資料卡 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <AvatarEditor
            initialAvatar={avatar}
            fallbackLetter={club.name?.[0] || "?"}
            uploadUrl={`/api/clubs/${username}/avatar`}
            editable={isOwner}
          />

          <div className="flex-1">
            {editing ? (
              <div>
                <input
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="社團名稱"
                />
                <input
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={form.school || ""}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  placeholder="學校（選填）"
                />
                <textarea
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={form.info || ""}
                  onChange={(e) => setForm({ ...form, info: e.target.value })}
                  placeholder="簡介"
                />
                <textarea
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={form.activity || ""}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  placeholder="活動內容（選填）"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-green-600 text-white rounded"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 bg-gray-300 rounded"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold">{club.name}</h1>
                {club.school && <p className="text-gray-600 mt-0.5">{club.school}</p>}
                {club.info && <p className="text-gray-700 mt-2 whitespace-pre-wrap">{club.info}</p>}
                {club.activity && (
                  <p className="text-gray-500 text-sm mt-2">活動：{club.activity}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {isOwner && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded"
                    >
                      編輯社團
                    </button>
                  )}

                  {/* 身分 + 洽談（任何登入者都可打開官方聊天室；未登入則不顯示下拉） */}
                  {me && (
                    <>
                      <select
                        value={selectedIdentity?.value || "me"}
                        onChange={(e) => {
                          const v = e.target.value
                          const opt = identities.find(x => x.value === v) || identities[0]
                          setSelectedIdentity(opt)
                        }}
                        className="border rounded px-2 py-1.5 text-sm"
                      >
                        {identities.map(opt => (
                          <option key={`${opt.type}:${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleChat}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded"
                      >
                        洽談
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 成員 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">成員</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">尚無成員</p>
        ) : (
          <MemberList
            members={members}
            clubUsername={username}
            canManage={role === "owner"}
            onUpdate={async () => {
              const res = await fetch(`/api/clubs/${username}/members`)
              if (res.ok) setMembers(await res.json())
            }}
          />
        )}
      </div>

      {/* 貼文（活動卡片） */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">活動</h2>
          {/* 僅社團成員可新增貼文/活動；你如果只想 owner 才能發可以改成 role === 'owner' */}
          {role && (
            <NewPostForm
              orgType="club"
              orgUsername={username}
              onPostCreated={(p) => setPosts((prev) => [p, ...prev])}
            />
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500">尚未有活動</p>
        ) : (
          <ul className="space-y-4">
            {posts.map(p => (
              <Post key={p.id} post={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
