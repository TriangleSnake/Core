import { useEffect, useState } from "react"
import UserCard from "../components/UserCard"

export default function Roster() {
  const [clubs, setClubs] = useState([])
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    fetch("/api/roster")
      .then(res => res.json())
      .then(data => {
        setClubs(data.clubs || [])
        setCompanies(data.companies || [])
      })
      .catch(err => console.error("載入 roster 失敗", err))
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-5">
      {/* 廠商 */}
      <div>
        <h2 className="text-lg font-medium">廠商（{companies.length}）</h2>
        <div className="grid gap-3 mt-2">
          {companies.map(c => (
            <UserCard
              key={c.id}
              user={{ id: c.id, name: c.name, bio: c.info, type: "廠商" }}
              avg={c.stars}
              count={c.ratingCount}
            />
          ))}
        </div>
      </div>

      {/* 社團 */}
      <div>
        <h2 className="text-lg font-medium">成功大學社團（{clubs.length}）</h2>
        <div className="grid gap-3 mt-2">
          {clubs.map(club => (
            <UserCard
              key={club.id}
              user={{ id: club.id, name: club.name, bio: club.info, type: "社團" }}
              avg={club.stars}
              count={club.ratingCount}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
