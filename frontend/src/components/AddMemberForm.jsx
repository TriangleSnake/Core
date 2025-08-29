import { useState, useEffect } from "react"

export default function AddMemberForm({ clubUsername, onAdded, onCancel }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [role, setRole] = useState("member")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    fetch(`/api/public/search-users?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setResults)
      .catch(() => {})
    return () => controller.abort()
  }, [query])

  async function handleAdd() {
    if (!selected) {
      alert("請選擇使用者")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/clubs/${clubUsername}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: selected.id, role })
      })
      const data = await res.json()
      if (res.ok) {
        onAdded()
      } else {
        alert("新增失敗：" + data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 border rounded-lg space-y-3 bg-gray-50">
      {/* 搜尋框 */}
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
        placeholder="搜尋 username / 姓名 / Email"
        className="w-full border rounded px-3 py-2"
      />

      {/* 自動完成結果 */}
      {results.length > 0 && !selected && (
        <ul className="border rounded bg-white max-h-40 overflow-y-auto">
          {results.map(u => (
            <li
              key={u.id}
              onClick={() => setSelected(u)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              {u.avatar ? (
                <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {u.name[0]}
                </div>
              )}
              <span>{u.name} (@{u.username})</span>
            </li>
          ))}
        </ul>
      )}

      {/* 選到的使用者 */}
      {selected && (
        <div className="flex items-center gap-2">
          {selected.avatar ? (
            <img src={selected.avatar} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
              {selected.name[0]}
            </div>
          )}
          <span className="font-medium">{selected.name}</span>
          <span className="text-gray-500">@{selected.username}</span>
        </div>
      )}

      {/* 角色選擇 */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border rounded px-3 py-2"
      >
        <option value="member">成員</option>
        <option value="admin">管理員</option>
      </select>

      {/* 操作按鈕 */}
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          確定新增
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          取消
        </button>
      </div>
    </div>
  )
}
