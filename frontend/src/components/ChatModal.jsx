import { useState } from 'react'
import RateBox from './RateBox'

export default function ChatModal({ meName = '我方', user, messages, onSend, onClose, onRate }) {
  const [text, setText] = useState('');
  const [showRate, setShowRate] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
              <span className="text-sm font-semibold">{user.name[0]}</span>
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-500">合作洽談視窗</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">關閉</button>
        </div>

        <div className="h-60 mt-3 border rounded-xl p-3 overflow-y-auto flex flex-col gap-2">
          {messages.length === 0 && (<div className="text-xs text-gray-400">還沒有訊息</div>)}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] px-3 py-2 rounded-2xl ${m.author === meName ? "self-end bg-black text-white" : "self-start bg-gray-100"}`}>
              <div className="text-xs opacity-70 mb-0.5">{m.author}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        {!showRate ? (
          <>
            <div className="flex gap-2 mt-3">
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSend(text, () => setText('')) }}
                placeholder="輸入訊息…" className="flex-1 border rounded-xl px-3 py-2"/>
              <button onClick={() => onSend(text, () => setText(''))} className="px-4 py-2 rounded-xl bg-black text-white">送出</button>
            </div>
            <div className="mt-2 flex justify-end">
              <button onClick={()=>setShowRate(true)} className="text-sm text-gray-700 underline">結束洽談並評分</button>
            </div>
          </>
        ) : (
          <div className="mt-3 border rounded-2xl p-3">
            <div className="font-medium">為「{user.name}」留下評價</div>
            <RateBox value={score} onChange={setScore}/>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3}
              placeholder="給對方的回饋…" className="w-full border rounded-xl px-3 py-2 mt-3"/>
            <div className="flex gap-2 justify-end mt-3">
              <button onClick={()=>setShowRate(false)} className="px-3 py-1.5 border rounded-xl">取消</button>
              <button onClick={()=>{ onRate(user.id, score, comment); onClose(); }} className="px-3 py-1.5 bg-black text-white rounded-xl">送出評價</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
