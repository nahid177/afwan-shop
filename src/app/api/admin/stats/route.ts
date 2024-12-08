// src/app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";
import { ApiAdminStatsResponse } from "@/interfaces/ApiAdminStatsResponse";

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Extract and verify the token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }

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
