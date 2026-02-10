import React, { useEffect, useMemo, useRef, useState } from 'react';

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const QUOTES = [
  'Every day may not be good, but there is something good in every day.',
  'You are stronger than you think.',
  'This too shall pass.',
  'Believe you can and you are halfway there.',
  'Start where you are. Use what you have. Do what you can.'
];

const JOKES = [
  'Why did the scarecrow win an award? Because he was outstanding in his field! 🌾',
  'I told my computer I needed a break, and it said “No problem—I’ll go to sleep.” 😴',
  'Why don’t skeletons fight each other? They don’t have the guts. 💀',
  'Parallel lines have so much in common. It’s a shame they’ll never meet. 📐'
];

function getReply(text, emotion){
  const t = (text||'').toLowerCase();
  if (/(joke|comedy|funny|laugh)/.test(t)) return pick(JOKES);
  if (/(quote|quotes|inspire|motivat|inspiration)/.test(t)) return pick(QUOTES);

  if (/(sad|down|unhappy)/.test(t) || emotion === 'sad') {
    return `I’m here for you. It’s okay to feel sad. ${pick(QUOTES)}`;
  }
  if (/(angry|mad|furious)/.test(t) || emotion === 'angry') {
    return 'Take a deep breath in... and out. Want a joke to lighten the mood? Say “joke”.';
  }
  if (/(stress|anx|worry)/.test(t) || emotion === 'fearful') {
    return 'Try the 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Ask me for a quote for calm.';
  }
  if (/(happy|joy|good)/.test(t) || emotion === 'happy') {
    return 'I love that energy! Want an inspirational quote or a joke?';
  }
  if (/clear|reset/.test(t)) return '__clear__';

  return 'Tell me how you feel. Ask “quote” for inspiration or “joke” for a laugh.';
}

export default function ChatBot(){
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [messages, setMessages] = useState(() => ([
    { role:'bot', text:'Hi! I’m your companion. Share how you feel, ask for a “quote” or say “joke”.' }
  ]));
  const listRef = useRef(null);

  useEffect(() => {
    function onEmo(e){ const em = e?.detail?.emotion; if (em) setEmotion(em); }
    window.addEventListener('moodsense:emotion-changed', onEmo);
    return () => window.removeEventListener('moodsense:emotion-changed', onEmo);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  function send(){
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role:'user', text }]);
    setInput('');
    const r = getReply(text, emotion);
    if (r === '__clear__') { setMessages([]); return; }
    setTimeout(() => setMessages(m => [...m, { role:'bot', text: r }]), 150);
  }

  function onKey(e){ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  return (
    <div className={`chatbot ${open ? 'open' : 'closed'}`}>
      <button className="chatbot-toggle btn" type="button" onClick={() => setOpen(v=>!v)} aria-label="Toggle chat">
        {open ? '–' : 'Chat'}
      </button>
      {open && (
        <div className="chatbot-window panel" role="dialog" aria-label="Chat bot">
          <div className="chatbot-header">Companion</div>
          <div className="chatbot-messages" ref={listRef}>
            {messages.map((m,i) => (
              <div key={i} className={`chatbot-msg ${m.role}`}>{m.text}</div>
            ))}
          </div>
          <div className="chatbot-input-row">
            <textarea
              className="input chatbot-input"
              rows={1}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your message..." />
            <button className="btn primary" type="button" onClick={send}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
