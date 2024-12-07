// src/app/api/admin/stats/route.ts

import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";
import Message from "@/models/Message";
import { ApiAdminStatsResponse } from "@/interfaces/ApiAdminStatsResponse";
import { jwtVerify } from "jose";

// Add this line to force the route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Extract and verify the token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify the JWT token
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 401 });
    }

    // **Utilize the payload** (e.g., log the user ID or enforce authorization)
    console.log(`Authenticated user ID: ${payload.userId}`);

    // Fetch total registrations from AdminUser model
    const totalRegistrations = await AdminUser.countDocuments();

    // Fetch total logins by counting all login events across AdminUser's devices
    const totalLoginsResult = await AdminUser.aggregate([
      { $unwind: "$devices" }, // Deconstruct the devices array
      { $count: "logins" }, // Count total logins
    ]);

    const totalLogins = totalLoginsResult[0]?.logins || 0;

    // Fetch user-sent messages not yet seen by admin
    const userSentMessagesNotSeen = await Message.countDocuments({
      status: "sent",
      sender: "User",
    });

    const stats: ApiAdminStatsResponse = {
      totalRegistrations,
      totalLogins,
      userSentMessagesNotSeen,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
