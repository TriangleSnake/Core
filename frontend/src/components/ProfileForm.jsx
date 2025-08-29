import { cls } from '../utils/cls'
import TagEditor from './TagEditor'

export default function ProfileForm({ value, onChange, onSave, onReset }) {
  const v = value || DEFAULT_PROFILE;
  function set(k, x){ onChange({ ...v, [k]: x }); }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="text-sm">身分類型</label>
        <div className="mt-1 flex gap-2">
          {['廠商','社團'].map(t => (
            <button key={t} onClick={()=>set('type', t)} className={cls("px-3 py-1.5 text-sm rounded-xl border", v.type===t?"bg-black text-white":"bg-white hover:bg-gray-50")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm">名稱</label>
        <input value={v.name} onChange={e=>set('name', e.target.value)} placeholder="例如：台灣大哥大 / 成大攝影社" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>
      <div>
        <label className="text-sm">聯絡信箱</label>
        <input value={v.contact} onChange={e=>set('contact', e.target.value)} placeholder="example@org.com" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>

      <div>
        <label className="text-sm">電話</label>
        <input value={v.phone} onChange={e=>set('phone', e.target.value)} placeholder="0912-xxx-xxx" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>
      <div>
        <label className="text-sm">窗口姓名</label>
        <input value={v.contactName} onChange={e=>set('contactName', e.target.value)} placeholder="聯絡窗口" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>

      <div>
        <label className="text-sm">官方網站</label>
        <input value={v.website} onChange={e=>set('website', e.target.value)} placeholder="https://..." className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>
      <div>
        <label className="text-sm">Logo / 圖片 URL</label>
        <input value={v.logoUrl} onChange={e=>set('logoUrl', e.target.value)} placeholder="https://...image.jpg" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm">簡介</label>
        <textarea value={v.bio} onChange={e=>set('bio', e.target.value)} rows={3} placeholder="簡要介紹單位、主力與亮點" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm">標籤</label>
        <TagEditor value={v.tags} onChange={x=>set('tags', x)}/>
      </div>

      <div className="md:col-span-2">
        <label className="text-sm">合作需求 / 提案</label>
        <textarea value={v.demand} onChange={e=>set('demand', e.target.value)} rows={4} placeholder="想找什麼合作？可提供哪些資源？時程與預算？" className="w-full border rounded-xl px-3 py-2 mt-1"/>
      </div>

      <div className="md:col-span-2 flex gap-2">
        <button onClick={onSave} className="px-4 py-2 rounded-xl bg-black text-white">儲存</button>
        <button onClick={onReset} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">重設</button>
      </div>
    </div>
  );
}