import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div>
        <h1 className="text-2xl font-bold mb-2">讓社團與品牌更快媒合、更有保障</h1>
        <p className="text-gray-600 mb-4">發佈你的活動需求、接受品牌提案、完成後互相評價，建立長期合作關係。</p>
        <div className="flex gap-2">
          <Link to="/campaigns/new" className="px-4 py-2 bg-black text-white rounded">發佈需求</Link>
          <Link to="/campaigns" className="px-4 py-2 border rounded">瀏覽案件</Link>
        </div>
      </div>
      <div className="rounded-xl border p-4 bg-white">
        <h2 className="font-semibold mb-2">近期高分社團／贊助商</h2>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>成大畢聯會（平均 4.8★）</li>
          <li>某某飲料品牌（平均 4.7★）</li>
        </ul>
      </div>
    </div>
  )
}
