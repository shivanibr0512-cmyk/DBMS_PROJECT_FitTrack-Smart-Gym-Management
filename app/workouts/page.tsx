"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Log = { _id: string; memberId: number; memberName: string; activity: string; durationMinutes: number; notes?: string; createdAt: string };

export default function WorkoutsPage() {
  const [logs,setLogs] = useState<Log[]>([]);
  const [memberId,setMemberId] = useState("1");
  const [memberName,setMemberName] = useState("Aarav Sharma");
  const [activity,setActivity] = useState("Strength training");
  const [duration,setDuration] = useState("45");
  const [notes,setNotes] = useState("");
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  async function load() {
    const res = await fetch("/api/workout-logs");
    const data = await res.json();
    if (res.ok) setLogs(data.logs || []);
    else setError(data.error || "Unable to load logs");
  }
  useEffect(()=>{ load(); },[]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    const res = await fetch("/api/workout-logs", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({memberId:Number(memberId),memberName,activity,durationMinutes:Number(duration),notes})
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Could not save log"); return; }
    setMessage("Workout log saved to MongoDB."); setNotes(""); await load();
  }

  return <main className="shell">
    <header className="topbar"><div className="brand">Fit<span>Track</span></div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/members">Members</Link><Link href="/attendance">Attendance</Link></nav></header>
    <section className="panel"><h1>Workout progress logs</h1><p>Flexible workout records are stored as MongoDB documents; member and membership records remain in MySQL.</p>
      <form className="form" onSubmit={submit}>
        <label>Member ID<input type="number" min="1" required value={memberId} onChange={e=>setMemberId(e.target.value)} /></label>
        <label>Member name<input required value={memberName} onChange={e=>setMemberName(e.target.value)} /></label>
        <label>Activity<input required value={activity} onChange={e=>setActivity(e.target.value)} /></label>
        <label>Duration (minutes)<input type="number" min="1" max="600" required value={duration} onChange={e=>setDuration(e.target.value)} /></label>
        <label>Notes (optional)<textarea rows={3} maxLength={1000} value={notes} onChange={e=>setNotes(e.target.value)} /></label>
        {message && <div className="notice">{message}</div>}{error && <div className="notice error">{error}</div>}
        <button className="btn" type="submit">Save workout log</button>
      </form>
    </section>
    <section className="panel" style={{marginTop:18}}><h2>Saved logs</h2>
      {logs.length===0 ? <p>No logs yet. Add one above.</p> : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Activity</th><th>Minutes</th><th>Notes</th><th>Created</th></tr></thead><tbody>
      {logs.map(log=><tr key={log._id}><td>{log.memberName} (#{log.memberId})</td><td>{log.activity}</td><td>{log.durationMinutes}</td><td>{log.notes || "—"}</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}
      </tbody></table></div>}
    </section>
  </main>;
}
