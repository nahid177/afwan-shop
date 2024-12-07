// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { deviceId } = await req.json();

    // Validate deviceId
    if (!deviceId) {
      return NextResponse.json({ message: "Device ID is required" }, { status: 400 });
    }

    // Find user and remove deviceId
    const result = await AdminUser.updateOne(
      { devices: deviceId },
      { $pull: { devices: deviceId } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Device not found or already removed" }, { status: 404 });
    }

    return NextResponse.json({ message: "Logout successful, device removed" }, { status: 200 });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ message: "Error during logout" }, { status: 500 });
  }
}
