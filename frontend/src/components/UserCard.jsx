import Avatar from './Avatar'
import Badge from './Badge'
import Stars from './Stars'

export default function UserCard({ user, onChat, avg, count }) {
  return (
    <div className="flex gap-3 p-4 border rounded-2xl bg-white hover:shadow-sm transition">
      <Avatar name={user.name} url={user.logoUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold truncate">{user.name}</div>
          <Badge>{user.type}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-gray-700">
          <Stars value={avg || 0} small />
          <span className="text-xs text-gray-500">{Number.isFinite(avg) ? avg.toFixed(2) : '—'}（{count || 0}）</span>
        </div>
        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{user.bio}</div>
        {user.tags?.length ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {user.tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 rounded px-2 py-0.5">#{t}</span>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex gap-2 items-center">
          <button onClick={() => onChat(user)} className="px-3 py-1.5 text-sm rounded-xl border bg-white hover:bg-gray-50">聯繫洽談</button>
          {user.website && <a href={user.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">官方網站</a>}
        </div>
      </div>
    </div>
  );
}
