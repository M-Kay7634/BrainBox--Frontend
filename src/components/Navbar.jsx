import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { getToken, removeToken } from "../utils/auth";
import { motion } from "framer-motion";

export default function Navbar() {
  const token = getToken();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full fixed top-0 left-0 z-40 backdrop-blur-sm"
    >
      <div className="container-max flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-primary">IQPlay</Link>
          <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <Link to="/leaderboard" className="opacity-80 hover:opacity-100">Leaderboard</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            {token ? (
              <>
                <Link to="/profile" className="px-3 py-1 rounded-lg bg-primary text-white text-sm flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" /> Profile
                </Link>
                <button onClick={() => { removeToken(); window.location.href = "/"; }} 
                        className="px-3 py-1 border rounded-lg text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 border rounded-lg text-sm">Login</Link>
                <Link to="/signup" className="px-3 py-1 bg-accent text-white rounded-lg text-sm">Signup</Link>
              </>
            )}
          </div>

          {/* mobile menu */}
          <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 rounded-lg border">
            {!open ? <Bars3Icon className="w-6 h-6" /> : <XMarkIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:hidden bg-white shadow-md">
          <div className="p-4 flex flex-col gap-3">
            <Link to="/leaderboard" onClick={() => setOpen(false)}>Leaderboard</Link>
            {token ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
                <button onClick={() => { removeToken(); window.location.href = "/"; }} className="text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)}>Signup</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
