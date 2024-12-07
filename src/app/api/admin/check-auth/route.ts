// src/app/api/admin/check-auth/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ authenticated: true }, { status: 200 });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
