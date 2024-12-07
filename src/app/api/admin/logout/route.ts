// src/app/api/admin/logout/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  await dbConnect();

  try {
    // Extract cookies from the request
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ message: "No authentication token found." }, { status: 401 });
    }

    // Extract the token from the cookie
    const tokenMatch = cookie.match(/token=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ message: "Authentication token is missing." }, { status: 401 });
    }

    const token = tokenMatch[1];
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");

    // Verify the JWT token
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }

    const { deviceId } = await req.json();

    // Validate deviceId
    if (!deviceId) {
      return NextResponse.json({ message: "Device ID is required." }, { status: 400 });
    }

    // Remove deviceId from the user's devices array
    const result = await AdminUser.updateOne(
      { _id: payload.userId, devices: deviceId },
      { $pull: { devices: deviceId } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Device not found or already removed." }, { status: 404 });
    }

    // Clear the 'token' cookie by setting it to expire in the past
    const response = NextResponse.json(
      { message: "Logout successful, device removed." },
      { status: 200 }
    );
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Sets the cookie to expire immediately
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ message: "Internal Server Error during logout." }, { status: 500 });
  }
}
