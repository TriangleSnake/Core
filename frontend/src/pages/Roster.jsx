import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import Post from "../components/Post"
import UserCard from "../components/UserCard"

export default function Roster() {
  const [active, setActive] = useState("events") // events | clubs | companies
  const [search, setSearch] = useState("")
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        // 活動（posts）
        const resPosts = await fetch("/api/public/posts")
        const posts = resPosts.ok ? await resPosts.json() : []

        // 名錄（社團 & 公司）
        const resRoster = await fetch("/api/roster")
        const roster = resRoster.ok ? await resRoster.json() : { clubs: [], companies: [] }

        if (!mounted) return
        setEvents(posts || [])
        setClubs(roster.clubs || [])
        setCompanies(roster.companies || [])
      } catch (e) {
        console.error("載入 roster 失敗", e)
      } finally {
        mounted = false
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // 搜尋過濾
  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events
    const q = search.toLowerCase()
    return events.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.content || "").toLowerCase().includes(q) ||
      (p.tags || "").toLowerCase().includes(q) ||
      (p.orgName || "").toLowerCase().includes(q) ||
      (p.authorName || "").toLowerCase().includes(q)
    )
  }, [events, search])

  const filteredClubs = useMemo(() => {
    if (!search.trim()) return clubs
    const q = search.toLowerCase()
    return clubs.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.school || "").toLowerCase().includes(q) ||
      (c.username || "").toLowerCase().includes(q)
    )
  }, [clubs, search])

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies
    const q = search.toLowerCase()
    return companies.filter(co =>
      (co.name || "").toLowerCase().includes(q) ||
      (co.businessNo || "").toLowerCase().includes(q) ||
      (co.username || "").toLowerCase().includes(q)
    )
  }, [companies, search])

  return (
    <div className="space-y-4">
      {/* 搜尋列 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 bg-white"
            placeholder="搜尋活動、社團、公司、標籤…"
          />
        </div>

        {/* 三段式 Switch */}
        <div className="bg-gray-100 rounded-full p-1 flex items-center">
          {[
            { key: "events", label: "活動" },
            { key: "clubs", label: "社團" },
            { key: "companies", label: "公司" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-4 py-1.5 rounded-full text-sm transition
                ${active === key ? "bg-white shadow text-black" : "text-gray-600 hover:text-black"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 內容 */}
      {loading ? (
        <div className="text-gray-500">載入中…</div>
      ) : (
        <>
          {/* 活動列表：中間主欄寬一些，右側可留給 Sidebar（若有） */}
          {active === "events" && (
            <div className="grid grid-cols-1">
              {filteredEvents.length === 0 ? (
                <div className="text-gray-500 col-span-full">查無活動</div>
              ) : (
                filteredEvents.map(p => (
                  <Post key={p.id} post={p} />
                ))
              )}
            </div>
          )}

          {/* 社團列表 */}
          {active === "clubs" && (
            <div className="grid md:grid-cols-1 gap-4">
              {filteredClubs.length === 0 ? (
                <div className="text-gray-500">查無社團</div>
              ) : (
                filteredClubs.map(c => (
                  <div
                    key={c.username}
                    className="cursor-pointer"
                    onClick={() => navigate(`/club/${c.username}`)}
                  >
                    <UserCard
                      user={{
                        id: c.username,
                        name: c.name,
                        bio: c.info,
                        type: "社團",
                      }}
                      avg={c.stars}
                      count={c.memberCount ?? c.ratingCount ?? 0}
                      onChat={() => navigate(`/club/${c.username}`)}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* 公司列表 */}
          {active === "companies" && (
            <div className="grid md:grid-cols-1 gap-4">
              {filteredCompanies.length === 0 ? (
                <div className="text-gray-500">查無公司</div>
              ) : (
                filteredCompanies.map(co => (
                  <div
                    key={co.username}
                    className="cursor-pointer"
                    onClick={() => navigate(`/company/${co.username}`)}
                  >
                    <UserCard
                      user={{
                        id: co.username,
                        name: co.name,
                        bio: co.info,
                        type: "公司",
                      }}
                      avg={co.stars}
                      count={co.memberCount ?? co.ratingCount ?? 0}
                      onChat={() => navigate(`/company/${co.username}`)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
