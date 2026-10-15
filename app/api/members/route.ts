import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/mysql";

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [rows] = await pool.query(
      `SELECT m.Member_ID, m.Name, m.Email, m.Phone, m.Join_Date,
              ms.Plan_Name, ms.Status AS Membership_Status
       FROM MEMBER m LEFT JOIN MEMBERSHIP ms ON ms.Member_ID=m.Member_ID
       ORDER BY m.Member_ID`
    );
    return NextResponse.json({ members: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load members." }, { status: 500 });
  }
}
