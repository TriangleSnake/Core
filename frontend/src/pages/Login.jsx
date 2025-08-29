import { useState } from "react"
import AuthForm from "../components/AuthForm"
import Alert from "../components/Alert"
import { login } from "../lib/api"

export default function Login({ onLogin }) {
  const [msg, setMsg] = useState({ type: "info", text: "" })

  const handleLogin = async (data) => {
    setMsg({ type: "info", text: "" })
    try {
      const res = await login(data.email, data.password)
      setMsg({ type: "success", text: `登入成功，歡迎 ${res.user.username || res.user.name || res.user.email}！` })
      onLogin?.(res.user)
      setTimeout(() => location = "/", 1000)
    } catch (err) {
      setMsg({ type: "error", text: "登入失敗：帳號或密碼不正確" })
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-center mb-3">
        <Alert
          type={msg.type}
          message={msg.text}
          onClose={() => setMsg({ type: "info", text: "" })}
        />
      </div>
      <AuthForm
        title="登入"
        submitText="登入"
        fields={[
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "密碼", type: "password", required: true },
        ]}
        onSubmit={handleLogin}
      />
    </div>
  )
}
