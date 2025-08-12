import { useState } from "react";
import { login } from "@/lib/auth";

export default function Login() {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { await login(u, p); window.location.href = "/"; }
    catch { setErr("Invalid credentials"); }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto mt-24 space-y-3">
      <input className="w-full border p-2 rounded" placeholder="Username" value={u} onChange={e=>setU(e.target.value)} />
      <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={p} onChange={e=>setP(e.target.value)} />
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <button className="w-full bg-primary text-white p-2 rounded">Log in</button>
    </form>
  );
}
