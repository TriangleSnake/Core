import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import AvatarEditor from "../components/AvatarEditor"

export default function CompanyProfile() {
  const { username } = useParams()   // ✅ 改成 username
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const resCo = await fetch(`/api/companies/${username}`, { credentials: "include" })
        if (resCo.ok) setCompany(await resCo.json())

        const resAvatar = await fetch(`/api/companies/${username}/avatar`, { credentials: "include" })
        if (resAvatar.ok) {
          const data = await resAvatar.json()
          setAvatar(data.avatar || null)
        }

        const resMembers = await fetch(`/api/companies/${username}/members`, { credentials: "include" })
        if (resMembers.ok) setMembers(await resMembers.json())
      } catch (err) {
        console.error("載入公司資料失敗", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [username])

  async function handleJoin() {
    const res = await fetch(`/api/companies/${username}/join`, { method: "POST", credentials: "include" })
    if (res.ok) {
      window.dispatchEvent(new Event("refresh-orgs"))
      location.reload()
    }
  }

  async function handleLeave() {
    const res = await fetch(`/api/companies/${username}/leave`, { method: "POST", credentials: "include" })
    if (res.ok) {
      window.dispatchEvent(new Event("refresh-orgs"))
      navigate("/")
    }
  }

  if (loading) return <div className="p-6">載入中...</div>
  if (!company) return <div className="p-6 text-red-500">找不到公司</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="border rounded-lg p-6 bg-white shadow flex gap-6 items-center">
        <AvatarEditor
          initialAvatar={avatar}
          fallbackLetter={company.name[0]}
          uploadUrl={`/api/companies/${username}/avatar`}
          editable={true}
        />
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          {company.businessNo && <p className="text-gray-600">統編：{company.businessNo}</p>}
          <p className="text-gray-700">{company.info}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={handleJoin} className="px-3 py-1 bg-green-500 text-white rounded">
              加入
            </button>
            <button onClick={handleLeave} className="px-3 py-1 bg-red-500 text-white rounded">
              退出
            </button>
          </div>
        </div>
      </div>

      {/* 成員 */}
      <div className="border rounded-lg p-6 bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">成員</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">尚無成員</p>
        ) : (
          <ul className="space-y-2">
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-3 p-3 border rounded">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {m.username ? m.username[0] : m.name[0]}
                </div>
                <div>
                  <div className="font-medium">{m.username || m.name}</div>
                  <div className="text-sm text-gray-500">{m.email}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
