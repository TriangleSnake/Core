import { useState } from "react"
import AddMemberForm from "./AddMemberForm"

export default function MemberList({ members, clubUsername, canManage, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [draftRoles, setDraftRoles] = useState(
    Object.fromEntries(members.map(m => [m.id, m.role]))
  )
  const [showAdd, setShowAdd] = useState(false)

  function toggleEdit() {
    setEditing(!editing)
    setDraftRoles(Object.fromEntries(members.map(m => [m.id, m.role])))
    setShowAdd(false)
  }

  async function saveRoles() {
    setLoading(true)
    try {
      for (const [userId, role] of Object.entries(draftRoles)) {
        const member = members.find(m => m.id === userId)
        if (member && member.role !== role) {
          await fetch(`/api/clubs/${clubUsername}/members/${userId}/role`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ role })
          })
        }
      }
      await onUpdate()
      setEditing(false)
    } catch (err) {
      alert("更新角色失敗：" + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeMember(userId) {
    if (!confirm("確定要移除這個成員嗎？")) return
    setLoading(true)
    try {
      await fetch(`/api/clubs/${clubUsername}/members/${userId}`, {
        method: "DELETE",
        credentials: "include"
      })
      await onUpdate()
    } catch (err) {
      alert("移除失敗：" + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ul className="space-y-2">
        {members.map(m => (
          <li key={m.id} className="flex items-center gap-3 p-3 border rounded">
            {editing && (
              <button
                onClick={() => removeMember(m.id)}
                disabled={loading}
                className="text-red-500 font-bold mr-2"
              >
                ×
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {m.username ? m.username[0] : m.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-medium">{m.username || m.name}</div>
              <div className="text-sm text-gray-500">{m.email}</div>
            </div>
            {editing ? (
              <select
                value={draftRoles[m.id]}
                onChange={(e) =>
                  setDraftRoles({ ...draftRoles, [m.id]: e.target.value })
                }
                disabled={loading}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="member">成員</option>
                <option value="admin">管理員</option>
                <option value="owner">擁有者</option>
              </select>
            ) : (
              <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">
                {m.role}
              </span>
            )}
          </li>
        ))}

        {/* 新增成員卡片 */}
        {editing && showAdd && (
          <li className="flex items-center gap-3 p-3 border rounded bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              ＋
            </div>
            <div className="flex-1">
              <AddMemberForm
                clubUsername={clubUsername}
                onAdded={async () => {
                  await onUpdate()
                  setShowAdd(false)
                }}
                onCancel={() => setShowAdd(false)}
              />
            </div>
          </li>
        )}
      </ul>

      {/* 新增成員按鈕 */}
      {editing && !showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          disabled={loading}
          className="mt-3 w-full border-2 border-dashed rounded-lg py-2 text-green-600 hover:bg-green-50"
        >
          ＋ 新增成員
        </button>
      )}

      {/* 控制列 */}
      {canManage && (
        <div className="mt-4 flex gap-2">
          {editing ? (
            <>
              <button
                onClick={saveRoles}
                disabled={loading}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                儲存變更
              </button>
              <button
                onClick={toggleEdit}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={toggleEdit}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              編輯成員
            </button>
          )}
        </div>
      )}
    </div>
  )
}
