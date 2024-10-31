// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";

export async function GET() {
  try {
    await dbConnect();

    // Fetch total registrations and total logins
    const totalRegistrations = await AdminUser.countDocuments();
    const totalLogins = await AdminUser.aggregate([
      { $unwind: "$devices" },
      { $count: "logins" },
    ]);

    return NextResponse.json({
      totalRegistrations,
      totalLogins: totalLogins[0]?.logins || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ message: "Error fetching stats" }, { status: 500 });
  }
}
