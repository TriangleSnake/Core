export default function AuthForm({ title, fields, onSubmit, submitText }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {fields.map(f => (
        <div key={f.name} className="mb-3">
          <label className="block text-sm mb-1">{f.label}</label>
          <input
            name={f.name}
            type={f.type || "text"}
            placeholder={f.placeholder}
            required={f.required}
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      ))}
      <button type="submit" className="w-full py-2 bg-black text-white rounded-xl hover:bg-gray-800">
        {submitText}
      </button>
    </form>
  )
}
