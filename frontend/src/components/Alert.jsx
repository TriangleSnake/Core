import { useEffect } from "react"

export default function Alert({ type="info", message, onClose, duration=3000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, duration, onClose])

  if (!message) return null

  const base = "rounded-xl px-4 py-3 text-sm shadow border"
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
  }[type] || styles.info

  return (
    <div className={`${base} ${styles}`}>
      {message}
    </div>
  )
}
