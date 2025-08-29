import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register } from "../lib/api"
import Alert from "../components/Alert"

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    name: "",     // ✅ 統一用 name
    phone: "",
    email: "",
    password: "",
  })
  const [msg, setMsg] = useState({ type: "info", text: "" })
  const navigate = useNavigate()

  const setField = (k, v) => setForm({ ...form, [k]: v })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      setMsg({ type: "success", text: "註冊成功！即將導向登入頁..." })
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      setMsg({ type: "error", text: "註冊失敗：Email 或 Username 已被使用 / 格式錯誤" })
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">建立新帳號</h2>
      {msg.text && (
        <Alert
          type={msg.type}
          message={msg.text}
          onClose={() => setMsg({ type: "info", text: "" })}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">暱稱</label>
          <input
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="例：小明"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">姓名</label>
          <input
            value={form.name}   // ✅ 用 form.name
            onChange={(e) => setField("name", e.target.value)}  // ✅ 修正這裡
            className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="王大明"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">手機</label>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="0912-345-678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">密碼</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="至少 6 碼"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800 transition"
        >
          註冊
        </button>
      </form>
    </div>
  )
}
