import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState({ clubs: [], companies: [] })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 取得使用者所屬組織
  async function fetchOrgs() {
    try {
      const res = await fetch("/api/me/orgs", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setOrgs(data)
      } else {
        setOrgs({ clubs: [], companies: [] })
      }
    } catch (err) {
      console.error("載入組織失敗", err)
      setOrgs({ clubs: [], companies: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgs()
    // 🔔 監聽 refresh 事件
    const handler = () => fetchOrgs()
    window.addEventListener("refresh-orgs", handler)
    return () => window.removeEventListener("refresh-orgs", handler)
  }, [])

  return (
    <>


      <div
  className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 z-40
  ${open ? "translate-x-0" : "-translate-x-full"}`}
>
  <div 
    onClick={() => setOpen(!open)} 
    className="absolute top-16 -right-5 w-5 h-16 bg-white border border-l-0 shadow flex items-center justify-center rounded-r cursor-pointer hover:bg-gray-50"
  >
    {open ? "←" : "→"}
  </div>

  {/* 內容 */}
  <div className="p-4 border-b">
    <h2 className="font-semibold text-lg">我的組織</h2>
  </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="text-gray-500 text-sm">載入中...</div>
          ) : (
            <>
              {/* 社團 */}
              <section>
                <h3 className="text-sm font-semibold mb-2">社團</h3>
                {orgs.clubs.length === 0 ? (
                  <div className="text-gray-500 text-xs">尚未加入社團</div>
                ) : (
                  <ul className="space-y-2">
                    {orgs.clubs.map(c => (
                      <li
                        key={c.username}   // ✅ 改成 username
                        onClick={() => navigate(`/club/${c.username}`)}  // ✅ 路徑也改
                        className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{c.name}</div>
                        {c.school && (
                          <div className="text-xs text-gray-500">{c.school}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* 公司 */}
              <section>
                <h3 className="text-sm font-semibold mb-2">公司</h3>
                {orgs.companies.length === 0 ? (
                  <div className="text-gray-500 text-xs">尚未加入公司</div>
                ) : (
                  <ul className="space-y-2">
                    {orgs.companies.map(co => (
                      <li
                        key={co.username}   // ✅ 改成 username
                        onClick={() => navigate(`/company/${co.username}`)}  // ✅ 路徑也改
                        className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="font-medium">{co.name}</div>
                        {co.businessNo && (
                          <div className="text-xs text-gray-500">
                            {co.businessNo}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* 新增組織 */}
          <button
            onClick={() => navigate("/orgs/new")}
            className="w-full p-3 rounded-lg border-2 border-dashed border-green-300 bg-green-100 text-green-700 text-2xl font-bold hover:bg-green-200 hover:border-green-400 transition flex items-center justify-center"
          >
            ＋
          </button>
        </div>
      </div>
    </>
  )
}
