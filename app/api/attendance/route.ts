import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/mysql";

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [rows] = await pool.query(
      `SELECT a.Attendance_ID, m.Name AS Member_Name, a.Attendance_Date, a.Check_In, a.Check_Out
       FROM ATTENDANCE a JOIN MEMBER m ON m.Member_ID=a.Member_ID
       ORDER BY a.Attendance_Date DESC`
    );
    return NextResponse.json({ attendance: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load attendance." }, { status: 500 });
  }
}
