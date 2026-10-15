import Link from "next/link";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/mysql";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  if (!await getSession()) redirect("/login");
  const [rows] = await pool.query(
    `SELECT a.Attendance_ID, m.Name AS Member_Name, a.Attendance_Date, a.Check_In, a.Check_Out
     FROM ATTENDANCE a JOIN MEMBER m ON m.Member_ID=a.Member_ID
     ORDER BY a.Attendance_Date DESC, a.Attendance_ID DESC`
  );
  return <main className="shell">
    <header className="topbar"><div className="brand">Fit<span>Track</span></div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/members">Members</Link><Link href="/workouts">Workout logs</Link></nav></header>
    <section className="panel"><h1>Attendance</h1><p>Attendance history stored in MySQL.</p>
      <div className="table-wrap"><table><thead><tr><th>ID</th><th>Member</th><th>Date</th><th>Check-in</th><th>Check-out</th></tr></thead>
      <tbody>{(rows as unknown as { Attendance_ID: number; Member_Name: string; Attendance_Date: Date | string; Check_In: string; Check_Out: string | null }[]).map(r=><tr key={r.Attendance_ID}><td>{r.Attendance_ID}</td><td>{r.Member_Name}</td><td>{String(r.Attendance_Date).slice(0,10)}</td><td>{String(r.Check_In)}</td><td>{r.Check_Out ? String(r.Check_Out) : "—"}</td></tr>)}</tbody></table></div>
    </section>
  </main>;
}
