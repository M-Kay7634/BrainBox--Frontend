// src/data/gamesList.js

export const GamesList = [
  {
    id: "memory",
    title: "Memory Flip",
    description: "Match pairs quickly",
    icon: "🃏",
    path: "/game/memory",
  },
  {
    id: "speed-math",
    title: "Speed Math",
    description: "Solve arithmetic fast",
    icon: "➕",
    path: "/game/math",
  },
  {
    id: "reaction",
    title: "Reaction Time",
    description: "Tap as fast as you can when the screen turns green.",
    icon: "⚡",
    path: "/game/reaction",
  },
  {
    id: "verbal-memory",
    title: "Verbal Memory",
    description: "Remember words and test your memory",
    icon: "🧠",
    path: "/game/verbal",
    },
    {
    id: "odd-one-out",
    title: "Odd-One-Out",
    description: "Spot the one item that doesn’t match.",
    icon: "👀",
    path: "/game/odd-one-out",
    },
    {
      id: "pattern-sequence",
      title: "Pattern Sequence",
      description: "Watch and repeat the growing color pattern.",
      icon: "🔁",
      path: "/game/pattern",
    },
    {
      id: "mental-rotation",
      title: "Mental Rotation",
      description: "Rotate 3D-like block shapes in your mind.",
      icon: "🧊",
      path: "/game/mental-rotation",
    },
    {
      id: "tower-of-hanoi",
      title: "Tower of Hanoi",
      path: "/games/tower-of-hanoi",
      description: "Classic puzzle — move disks with minimal moves.",
      thumbnail: "/images/tower-of-hanoi.png",
    },
    {
      id: "lights-out",
      slug: "lights-out",
      title: "Lights Out Puzzle",
      description: "Toggle a cell and its neighbors — turn all lights OFF in minimum moves.",
      thumbnail: "/assets/games/lights-out.png",
      path: "/games/lights-out",
      difficulty: ["Easy", "Medium", "Hard", "Expert"],
    },







  // ⭐️ Add future games here:
  // {
  //   id: "pattern",
  //   title: "Pattern Recognition",
  //   description: "Find patterns and improve logic.",
  //   icon: "🔷",
  //   path: "/game/pattern"
  // }
];
