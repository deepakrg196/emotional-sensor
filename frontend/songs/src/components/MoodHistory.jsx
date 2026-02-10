import React, { useEffect, useState } from 'react';
import { getHistory } from '../api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function MoodHistory() {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    function refresh() {
      setList(getHistory(user?.email || ''));
    }
    refresh();
    function onStorage(e) {
      if (e.key === 'moodsense:history') refresh();
    }
    window.addEventListener('storage', onStorage);
    window.addEventListener('moodsense:history-updated', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('moodsense:history-updated', refresh);
    };
  }, [user?.email]);

  return (
    <div className="panel">
      <h3 className="panel-subtitle">Mood history</h3>
      {list.length === 0 ? (
        <p className="muted">No entries yet.</p>
      ) : (
        <ul className="history-list">
          {list.map((e, i) => (
            <li key={i} className={`history-item mood-${e.mood}`}>
              <div className="history-row">
                <span className="badge">{e.mood}</span>
                <time className="time">{new Date(e.at).toLocaleString()}</time>
              </div>
              {e.note ? <p className="note">{e.note}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
