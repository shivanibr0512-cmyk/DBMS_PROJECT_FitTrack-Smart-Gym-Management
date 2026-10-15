import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "fittrack_nosql");
    const logs = await db.collection("workout_logs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ logs: logs.map(log => ({ ...log, _id: String(log._id), createdAt: log.createdAt?.toISOString?.() ?? String(log.createdAt) })) });
  } catch (error) {
    console.error("Mongo GET error:", error);
    return NextResponse.json({ error: "Could not load workout logs. Check MONGODB_URI." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await getSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const memberId = Number(body.memberId);
    const memberName = String(body.memberName || "").trim();
    const activity = String(body.activity || "").trim();
    const durationMinutes = Number(body.durationMinutes);
    const notes = String(body.notes || "").trim().slice(0, 1000);
    if (!Number.isInteger(memberId) || memberId < 1 || !memberName || !activity ||
        !Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 600) {
      return NextResponse.json({ error: "Provide a valid member ID, name, activity, and duration (1–600 minutes)." }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || "fittrack_nosql");
    await db.collection("workout_logs").createIndex({ memberId: 1, createdAt: -1 });
    const result = await db.collection("workout_logs").insertOne({
      memberId, memberName, activity, durationMinutes, notes,
      createdAt: new Date()
    });
    return NextResponse.json({ ok: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error("Mongo POST error:", error);
    return NextResponse.json({ error: "Could not save workout log. Check MongoDB connection." }, { status: 500 });
  }
}
