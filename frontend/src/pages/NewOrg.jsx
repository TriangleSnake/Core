import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import Alert from "../components/Alert"

export default function NewOrg({ user }) {
  const [tab, setTab] = useState("select") // select | create
  const [orgs, setOrgs] = useState([])
  const [form, setForm] = useState({ type: "club", name: "", info: "", school: "", businessNo: "" })
  const [msg, setMsg] = useState({ type: "info", text: "" })   // ✅ Alert 狀態
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")   // 沒登入就丟回登入頁
    }
    fetch("/api/roster")
      .then(res => res.json())
      .then(data => {
        const merged = [
          ...data.clubs.map(c => ({ ...c, type: "club" })),
          ...data.companies.map(c => ({ ...c, type: "company" }))
        ]
        setOrgs(merged)
      })
  }, [user,Navigate])

  const joinOrg = async (orgId, orgType) => {
    try {
      const res = await fetch(`/api/${orgType}/${orgId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // ✅ 帶 cookie
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMsg({ type: "error", text: "加入失敗：" + (data.error || res.statusText) })
        return
      }

      setMsg({ type: "success", text: "加入成功！即將導向首頁..." })
      setTimeout(() => navigate("/"), 1500)
    } catch (err) {
      setMsg({ type: "error", text: "加入失敗：伺服器錯誤 " + err.message })
    }
  }

  const createOrg = async (e) => {
    e.preventDefault()
    try {
      const url = form.type === "club" ? "/api/clubs" : "/api/companies"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setMsg({ type: "error", text: "建立失敗：" + (data.error || res.statusText) })
        return
      }

      setMsg({ type: "success", text: "建立成功！即將導向首頁..." })
      setTimeout(() => navigate("/"), 1500)
    } catch (err) {
      setMsg({ type: "error", text: "建立失敗：伺服器錯誤 " + err.message })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow">
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("select")} className={`px-3 py-1.5 rounded-lg ${tab==="select"?"bg-black text-white":"border"}`}>
          選擇現有組織
        </button>
        <button onClick={()=>setTab("create")} className={`px-3 py-1.5 rounded-lg ${tab==="create"?"bg-black text-white":"border"}`}>
          建立新組織
        </button>
      </div>

      {/* ✅ Alert */}
      {msg.text && (
        <Alert
          type={msg.type}
          message={msg.text}
          onClose={() => setMsg({ type: "info", text: "" })}
        />
      )}

      {tab==="select" ? (
        <div className="grid gap-3">
          {orgs.map(o => (
            <div key={o.id} className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-gray-500">{o.type==="club"?"社團":"廠商"}</div>
              </div>
              <button onClick={()=>joinOrg(o.id, o.type)} className="px-3 py-1.5 rounded bg-black text-white text-sm">
                加入
              </button>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={createOrg} className="space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={()=>setForm({...form, type:"club"})}
              className={`px-3 py-1.5 rounded-lg ${form.type==="club"?"bg-black text-white":"border"}`}>社團</button>
            <button type="button" onClick={()=>setForm({...form, type:"company"})}
              className={`px-3 py-1.5 rounded-lg ${form.type==="company"?"bg-black text-white":"border"}`}>廠商</button>
          </div>

          <input placeholder="名稱" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
            className="w-full border rounded px-3 py-2"/>

          {form.type==="club" && (
            <input placeholder="學校" value={form.school} onChange={e=>setForm({...form, school:e.target.value})}
              className="w-full border rounded px-3 py-2"/>
          )}

          {form.type==="company" && (
            <input placeholder="統編" value={form.businessNo} onChange={e=>setForm({...form, businessNo:e.target.value})}
              className="w-full border rounded px-3 py-2"/>
          )}

          <textarea placeholder="簡介" value={form.info} onChange={e=>setForm({...form, info:e.target.value})}
            className="w-full border rounded px-3 py-2"/>

          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg">建立</button>
        </form>
      )}
    </div>
  )
}
