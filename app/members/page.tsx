import Link from "next/link";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/mysql";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  if (!await getSession()) redirect("/login");
  const [rows] = await pool.query(
    `SELECT m.Member_ID, m.Name, m.Email, m.Phone, m.Join_Date,
            ms.Plan_Name, ms.Status AS Membership_Status
     FROM MEMBER m LEFT JOIN MEMBERSHIP ms ON ms.Member_ID=m.Member_ID
     ORDER BY m.Member_ID`
  );
  return <main className="shell">
    <header className="topbar"><div className="brand">Fit<span>Track</span></div><nav className="nav"><Link href="/">Dashboard</Link><Link href="/attendance">Attendance</Link><Link href="/workouts">Workout logs</Link></nav></header>
    <section className="panel"><h1>Members</h1><p>Member details joined with membership information from MySQL.</p>
      <div className="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Plan</th><th>Status</th></tr></thead>
      <tbody>{(rows as unknown as { Member_ID: number; Name: string; Email: string; Phone: string; Join_Date: Date | string; Plan_Name: string | null; Membership_Status: string | null }[]).map(r=><tr key={r.Member_ID}><td>{r.Member_ID}</td><td>{r.Name}</td><td>{r.Email}</td><td>{r.Phone}</td><td>{String(r.Join_Date).slice(0,10)}</td><td>{r.Plan_Name ?? "—"}</td><td>{r.Membership_Status ?? "—"}</td></tr>)}</tbody></table></div>
    </section>
  </main>;
}
