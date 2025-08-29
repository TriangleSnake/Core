import { useState } from "react"

export default function AvatarEditor({ initialAvatar, fallbackLetter = "?", uploadUrl, editable = true }) {
  const [avatar, setAvatar] = useState(initialAvatar || null)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      setAvatar(base64)

      if (!editable) return

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatar: base64 }),
      })

      if (!res.ok) {
        alert("更新頭貼失敗")
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative inline-block">
      <label className={editable ? "cursor-pointer" : ""}>
        {avatar ? (
          <img
            src={avatar}
            alt="頭貼"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-white">
            {fallbackLetter}
          </div>
        )}

        {editable && (
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        )}
        {editable && (
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-0.5 rounded">
            編輯
          </div>
        )}
      </label>
    </div>
  )
}
