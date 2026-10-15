"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not sign in");
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setBusy(false); }
  }

  return <main className="shell" style={{maxWidth:620,paddingTop:"8vh"}}>
    <section className="panel">
      <div className="brand">Fit<span>Track</span></div>
      <p>SMART GYM MANAGEMENT SYSTEM</p>
      <h1>Sign in</h1>
      <p>Use an account created in the <code>app_users</code> table by the setup instructions.</p>
      <form className="form" onSubmit={submit}>
        <label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error && <div className="notice error">{error}</div>}
        <button className="btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="small">Demo setup: create one Admin and one Trainer account using the SQL instructions in README.md. Never expose real passwords in screenshots or GitHub.</p>
    </section>
  </main>;
}
