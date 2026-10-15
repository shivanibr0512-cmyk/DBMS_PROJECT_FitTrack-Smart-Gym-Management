import Link from "next/link";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/mysql";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [members] = await pool.query("SELECT COUNT(*) AS total FROM MEMBER");
  const [trainers] = await pool.query("SELECT COUNT(*) AS total FROM TRAINER");
  const [active] = await pool.query("SELECT COUNT(*) AS total FROM MEMBERSHIP WHERE Status = 'Active'");
  const [revenue] = await pool.query("SELECT COALESCE(SUM(Amount),0) AS total FROM PAYMENT WHERE Status = 'Completed'");
  const [recent] = await pool.query(
    `SELECT m.Name AS Member_Name, a.Attendance_Date, a.Check_In, a.Check_Out
     FROM ATTENDANCE a JOIN MEMBER m ON m.Member_ID = a.Member_ID
     ORDER BY a.Attendance_Date DESC, a.Check_In DESC LIMIT 6`
  );
  const stats = {
    members: Number(Number((members as unknown as { total: number | string }[])[0].total)),
    trainers: Number(Number((trainers as unknown as { total: number | string }[])[0].total)),
    active: Number(Number((active as unknown as { total: number | string }[])[0].total)),
    revenue: Number(Number((revenue as unknown as { total: number | string }[])[0].total))
  };

  return <main className="shell">
    <header className="topbar">
      <div className="brand">Fit<span>Track</span></div>
      <nav className="nav">
        <Link href="/">Dashboard</Link><Link href="/members">Members</Link><Link href="/attendance">Attendance</Link><Link href="/workouts">Workout logs</Link>
        <form action="/api/auth/logout" method="post"><button className="btn secondary" type="submit">Log out</button></form>
      </nav>
    </header>
    <section className="panel">
      <div className="spread"><div><p>SMART GYM MANAGEMENT SYSTEM</p><h1>Welcome, {user.name}.</h1><p>Signed in as <b>{user.role}</b>. Here&apos;s your gym overview.</p></div><div className="notice">SQL + MongoDB starter</div></div>
      <div className="grid">
        <div className="stat">Total members<div className="num">{stats.members}</div></div>
        <div className="stat">Trainers<div className="num">{stats.trainers}</div></div>
        <div className="stat">Active memberships<div className="num">{stats.active}</div></div>
        <div className="stat">Completed payments<div className="num">₹{stats.revenue.toLocaleString("en-IN")}</div></div>
      </div>
    </section>
    <section className="panel" style={{marginTop:18}}>
      <h2>Recent attendance</h2>
      <div className="table-wrap"><table><thead><tr><th>Member</th><th>Date</th><th>Check-in</th><th>Check-out</th></tr></thead>
        <tbody>{(recent as unknown as { Member_Name: string; Attendance_Date: Date | string; Check_In: string; Check_Out: string | null }[]).map((r,i)=><tr key={i}><td>{r.Member_Name}</td><td>{String(r.Attendance_Date).slice(0,10)}</td><td>{String(r.Check_In)}</td><td>{r.Check_Out ? String(r.Check_Out) : "Still checked in"}</td></tr>)}</tbody>
      </table></div>
    </section>
  </main>;
}
