import Avatar from "./Avatar"
import Badge from './Badge'

export default function ProfilePreview({ data }) {
  const d = data || DEFAULT_PROFILE;
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="flex items-start gap-3">
        <Avatar name={d.name || '預覽'} url={d.logoUrl} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-lg truncate">{d.name || '（未命名）'}</div>
            <Badge>{d.type}</Badge>
          </div>
          {d.website && <a href={d.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{d.website}</a>}
          <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{d.bio || '在這裡顯示你的簡介。'}</div>
          {d.tags?.length ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {d.tags.map(t => <span key={t} className="text-xs bg-gray-100 rounded px-2 py-0.5">#{t}</span>)}
            </div>
          ) : null}
          <div className="text-sm text-gray-600 mt-3">
            <div>聯絡信箱：{d.contact || '—'}</div>
            <div>電話：{d.phone || '—'}</div>
            <div>聯絡窗口：{d.contactName || '—'}</div>
          </div>
          <div className="text-sm mt-3"><span className="font-medium">合作需求：</span>
            <div className="text-gray-700 whitespace-pre-wrap">{d.demand || '（尚未填寫）'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}