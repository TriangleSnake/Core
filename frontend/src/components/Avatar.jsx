export default function Avatar({ name, url }) {
  const hue = (name?.charCodeAt?.(0) * 39) % 360 || 200;
  if (url) {
    return <img src={url} alt="" className="w-20 h-20 rounded-2xl object-cover"/>;
  }
  return (
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0" 
         style={{ background: `hsl(${hue} 70% 85%)` }}>
      <span className="opacity-70">{name?.[0] || '?'}</span>
    </div>
  );
}
