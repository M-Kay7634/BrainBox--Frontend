import React, { useEffect, useState } from "react";
import { getAchievements } from "../services/api";

export default function Achievements() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getAchievements().then(r => setList(r.data || [])).catch(()=>setList([]));
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold">Achievements</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
        {list.length === 0 && <div className="card-soft p-4">No achievements yet</div>}
        {list.map(a => (
          <div key={a._id} className="card-soft p-4 flex flex-col">
            <strong className="text-sm">{a.title}</strong>
            <p className="text-xs text-muted mt-1">{a.description}</p>
            <small className="text-xs text-muted mt-2">{new Date(a.date).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
