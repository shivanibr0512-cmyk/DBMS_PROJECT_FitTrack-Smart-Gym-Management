import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/mysql";
import { createSession } from "@/lib/auth";

type LoginUser = {
  User_ID: number;
  Name: string;
  Email: string;
  Password_Hash: string;
  Role: "Admin" | "Trainer";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      "SELECT User_ID, Name, Email, Password_Hash, Role FROM app_users WHERE Email = ? LIMIT 1",
      [email]
    );

    const users = rows as unknown as LoginUser[];

    if (
      !users.length ||
      !(await bcrypt.compare(password, users[0].Password_Hash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const row = users[0];

    if (row.Role !== "Admin" && row.Role !== "Trainer") {
      return NextResponse.json(
        { error: "This role is not allowed in the demo app." },
        { status: 403 }
      );
    }

    await createSession({
      userId: row.User_ID,
      name: row.Name,
      email: row.Email,
      role: row.Role,
    });

    return NextResponse.json({ ok: true, role: row.Role });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error:
          "Login service failed. Check database setup and server logs.",
      },
      { status: 500 }
    );
  }
}
