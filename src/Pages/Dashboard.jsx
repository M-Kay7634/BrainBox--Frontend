import React from "react";
import GameCard from "../components/GameCard";

export default function Dashboard() {
  const games = [
    { title: "Memory Flip", path: "/game/memory", description: "Match pairs quickly", icon: "🃏" },
    { title: "Speed Math", path: "/game/math", description: "Solve arithmetic fast", icon: "➕" },
    { title: "Reaction Time", path: "/game/reaction", description: "Test your reflex", icon: "⚡" }
  ];

  return (
    <div>
      {/* HERO */}
      <section className="bg-white card-soft p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <span className="hero-ribbon">New</span>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
              Play quick games — <span className="text-primary">boost your IQ</span>
            </h1>
            <p className="mt-3 text-muted">Short, fun mini-games to train memory, reaction, and logic. Track progress and compete on leaderboards.</p>
            <div className="mt-6 flex gap-3">
              <a href="#games" className="px-4 py-2 bg-primary text-white rounded-md">Start Playing</a>
              <a href="#features" className="px-4 py-2 border rounded-md">Features</a>
            </div>
          </div>

          <div className="w-full md:w-3/12">
            <div className="card-soft p-4 text-center">
              <div className="text-3xl">🏆</div>
              <div className="mt-2 font-semibold">Top Score</div>
              <div className="text-muted text-sm mt-1">Memory Flip — 120</div>
            </div>
          </div>
        </div>
      </section>

      {/* GAMES GRID */}
      <section id="games">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(g => <GameCard key={g.title} {...g} />)}
        </div>
      </section>
    </div>
  );
}
