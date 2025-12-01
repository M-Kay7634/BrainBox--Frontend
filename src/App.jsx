import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import MemoryGame from "./games/MemoryGame";
import SpeedMath from "./games/SpeedMath";
import Result from "./pages/Result";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import TestTailwind from "./TestTailwind";

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
