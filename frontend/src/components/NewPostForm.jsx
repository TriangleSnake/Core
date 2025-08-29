import { useState } from "react"

export default function NewPostForm({ orgType, orgUsername, onPostCreated }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    participants: "",
    budget: "",
    event_date: "",
    event_location: ""
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (k, v) => setForm({ ...form, [k]: v })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/${orgType}s/${orgUsername}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        onPostCreated(data)
        setForm({
          title: "", content: "", tags: "", participants: "",
          budget: "", event_date: "", event_location: ""
        })
      } else {
        alert("建立失敗：" + data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <input className="w-full border rounded px-3 py-2" placeholder="活動標題"
        value={form.title} onChange={e => handleChange("title", e.target.value)} />

      <textarea className="w-full border rounded px-3 py-2" placeholder="活動內容"
        value={form.content} onChange={e => handleChange("content", e.target.value)} />

      <input className="w-full border rounded px-3 py-2" placeholder="標籤 (逗號分隔)"
        value={form.tags} onChange={e => handleChange("tags", e.target.value)} />

      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-2" placeholder="參與人數"
          value={form.participants} onChange={e => handleChange("participants", e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="預算"
          value={form.budget} onChange={e => handleChange("budget", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input type="date" className="border rounded px-3 py-2"
          value={form.event_date} onChange={e => handleChange("event_date", e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="活動地點"
          value={form.event_location} onChange={e => handleChange("event_location", e.target.value)} />
      </div>

      <button disabled={loading}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
        {loading ? "發佈中..." : "發佈活動"}
      </button>
    </form>
  )
}
