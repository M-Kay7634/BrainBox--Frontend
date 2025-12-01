import React, { useEffect, useState } from "react";
import { getGlobalTop, getDailyTop } from "../services/api";

export default function Leaderboard(){
  const [global,setGlobal] = useState([]); const [daily,setDaily] = useState([]); const [game,setGame] = useState('');

  useEffect(()=>{ load(); }, [game]);

  const load = async () => {
    const g = await getGlobalTop(game).then(r=>r.data).catch(()=>[]);
    const d = await getDailyTop(game).then(r=>r.data).catch(()=>[]);
    setGlobal(g); setDaily(d);
  };

  return (
    <div>
      <div className="card-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <select value={game} onChange={e=>setGame(e.target.value)} className="input input-bordered">
            <option value="">All Games</option>
            <option value="Memory Flip">Memory Flip</option>
            <option value="Speed Math">Speed Math</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Global Top</h3>
            <ol className="list-decimal ml-5">
              {global.map(s=> <li key={s._id} className="py-1">{s.playerName||'Guest'} — {s.score} <small className="text-muted">({new Date(s.date).toLocaleString()})</small></li>)}
            </ol>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Today's Top</h3>
            <ol className="list-decimal ml-5">
              {daily.map(s=> <li key={s._id} className="py-1">{s.playerName||'Guest'} — {s.score} <small className="text-muted">({new Date(s.date).toLocaleTimeString()})</small></li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
