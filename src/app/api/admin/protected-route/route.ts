// src/pages/api/admin/protected-route.ts

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie');
  if (!cookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = tokenMatch[1];

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Access payload data as needed
    return NextResponse.json({ message: "Protected data accessed", payload }, { status: 200 });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
