import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./Pages/Dashboard";
import MemoryGame from "./games/MemoryGame";
import SpeedMath from "./games/SpeedMath";
import Result from "./Pages/Result";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Profile from "./Pages/Profile";
import Leaderboard from "./Pages/Leaderboard";
import ReactionTime from "./games/ReactionTime";
import OddOneOut from "./games/OddOneOut";
import VerbalMemory from "./games/VerbalMemory";
import PatternSequence from "./games/PatternSequence";
import MentalRotation from "./games/MentalRotation";
import TowerOfHanoi from "./games/TowerOfHanoi";
import LightsOut from "./games/LightsOut";





export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        {/* Soft decorative shapes */}
        <div aria-hidden className="absolute -left-24 -top-24 w-72 h-72 bg-primary/30 rounded-full blur-3xl bg-shape"></div>
        <div aria-hidden className="absolute right-0 top-32 w-56 h-56 bg-accent/30 rounded-full blur-3xl bg-shape"></div>

        <Navbar />
        <main className="container-max pt-28 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/game/memory" element={<MemoryGame />} />
            <Route path="/game/math" element={<SpeedMath />} />
            <Route path="/result" element={<Result />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/game/reaction" element={<ReactionTime />} />
            <Route path="/game/odd-one-out" element={<OddOneOut />} />
            <Route path="/game/verbal" element={<VerbalMemory />} />
            <Route path="/game/pattern" element={<PatternSequence />} />
            <Route path="/game/mental-rotation" element={<MentalRotation />} />
            <Route path="/games/tower-of-hanoi" element={<TowerOfHanoi />} />
            <Route path="/games/lights-out" element={<LightsOut />} />



          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
