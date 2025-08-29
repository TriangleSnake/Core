import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Sidebar({ orgs = [] }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-20 left-4 z-50 p-2 rounded-lg bg-black text-white"
      >
        {open ? "←" : "→"}
      </button>

      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">我的社團</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {orgs.length === 0 ? (
            <div className="text-gray-500 text-sm">尚無組織</div>
          ) : (
            orgs.map(o => (
              <div key={o.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">{o.name}</div>
                {o.info && <div className="text-xs text-gray-500">{o.info}</div>}
              </div>
            ))
          )}

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
