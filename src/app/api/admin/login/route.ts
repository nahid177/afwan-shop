// src/app/api/admin/login/route.ts

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic"; // Mark the route as dynamic

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, password, deviceId } = await req.json();

    // Validate input
    if (!username || !password || !deviceId) {
      return NextResponse.json(
        { message: "Username, password, and device ID are required." },
        { status: 400 }
      );
    }

    // Find user by username
    const adminUser = await AdminUser.findOne({ username });
    if (!adminUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // Check device limit
    if (adminUser.devices.length >= 2 && !adminUser.devices.includes(deviceId)) {
      return NextResponse.json(
        { message: "Maximum devices reached. Cannot log in from this device." },
        { status: 403 }
      );
    }

    // Add deviceId if not already present
    if (!adminUser.devices.includes(deviceId)) {
      adminUser.devices.push(deviceId);
      await adminUser.save();
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKeyHere";
    const token = await new SignJWT({ userId: adminUser._id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set the token in an HttpOnly cookie
    const response = NextResponse.json({ message: "Login successful." }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour in seconds
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Internal Server Error during login." }, { status: 500 });
  }
}
