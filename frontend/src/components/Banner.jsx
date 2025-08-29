import { Link } from "react-router-dom"

export default function Banner({ user, onLoginClick, onLogout }) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <h1 className="text-2xl font-semibold">廠商 × 成大社團 配對平台</h1>

      <div className="flex items-center gap-3">
        {!user ? (
          <>
            <button
              onClick={onLoginClick}
              className="px-3 py-1.5 text-sm rounded-xl border hover:bg-gray-100"
            >登入</button>
            <Link
              to="/register"
              className="px-3 py-1.5 text-sm rounded-xl border hover:bg-gray-100"
            >註冊</Link>
          </>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-700">
              👋 {user.username || user.fullName || user.email}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm rounded-xl border hover:bg-gray-100"
            >登出</button>
          </>
        )}
      </div>
    </div>
  )
}
