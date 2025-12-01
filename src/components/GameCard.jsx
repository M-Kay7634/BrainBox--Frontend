import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function GameCard({ title, description, path, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 50px rgba(99,102,241,0.12)" }}
      transition={{ duration: 0.28 }}
      className="card-soft p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary text-2xl">
          {icon || "🎮"}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm mt-1 text-muted">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Link to={path} className="px-3 py-1.5 bg-primary text-white rounded-md text-sm">Play</Link>
        <button className="px-3 py-1.5 border rounded-md text-sm">Info</button>
      </div>
    </motion.div>
  );
}
