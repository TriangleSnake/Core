import { useNavigate } from "react-router-dom"
import Avatar from "./Avatar"
import Badge from "./Badge"
import Stars from "./Stars"

export default function UserCard({ user, onChat, avg, count }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (user.type === "社團") {
      navigate(`/club/${user.username}`)
    } else if (user.type === "廠商") {
      navigate(`/company/${user.username}`)
    } else if (user.type === "使用者") {
      navigate(`/users/${user.username}`)
    }
  }

  return (
    <div
      className="flex gap-3 p-4 border rounded-2xl bg-white hover:shadow-sm transition cursor-pointer"
      onClick={handleClick}   // ✅ 點擊整張卡片跳轉
    >
      <Avatar name={user.name} url={user.logoUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold truncate">{user.name}</div>
          <Badge>{user.type}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-gray-700">
          <Stars value={avg || 0} small />
          <span className="text-xs text-gray-500">
            {Number.isFinite(avg) ? avg.toFixed(2) : "—"}（{count || 0}）
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</div>
        {user.tags?.length ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-gray-100 rounded px-2 py-0.5"
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex gap-2 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation()   // ✅ 避免冒泡影響卡片點擊
              onChat?.(user)
            }}
            className="px-3 py-1.5 text-sm rounded-xl border bg-white hover:bg-gray-50"
          >
            聯繫洽談
          </button>
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}  // ✅ 避免冒泡
            >
              官方網站
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
