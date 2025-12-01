import React, { useState } from "react";
import { signup } from "../services/api";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Signup(){
  const [name,setName] = useState(''); const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await signup({ name, email, password });
      saveToken(res.data.token);
      navigate('/');
    } catch (err) { alert(err.response?.data?.msg || 'Signup failed'); }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card-soft p-6 mt-8">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
          <input className="input input-bordered" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input input-bordered" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input input-bordered" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="px-4 py-2 bg-accent text-white rounded-md">Signup</button>
        </form>
      </div>
    </div>
  );
}
