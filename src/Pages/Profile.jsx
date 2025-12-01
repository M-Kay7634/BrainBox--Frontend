import React, { useEffect, useState } from "react";
import { getUserScores } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Achievements from "../components/Achievements";

export default function Profile(){
  const [scores, setScores] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(()=> {
    getUserScores().then(res => {
      const s = res.data || [];
      const chart = s.map(x => ({ date: new Date(x.date).toLocaleDateString(), score: x.score }));
      setScores(chart);
      setDates(s.map(x => new Date(x.date)));
    }).catch(()=>{ setScores([]); setDates([]); });
  }, []);

  return (
    <div>
      <div className="card-soft p-6 mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold">Score Progress</h3>
            <LineChart width={520} height={260} data={scores}>
              <CartesianGrid stroke="#f1f5f9" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} />
            </LineChart>
          </div>
          <div>
            <h3 className="font-semibold">Game Streak</h3>
            <Calendar value={new Date()} tileClassName={({date}) => dates.some(d=> d.toDateString() === date.toDateString()) ? 'bg-primary/20 rounded-full' : null } />
          </div>
        </div>
      </div>

      <Achievements />
    </div>
  );
}
