import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AdminUser from "@/models/AdminUser";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalRegistrations = await AdminUser.countDocuments();
    const totalLoginsResult = await AdminUser.aggregate([
      { $unwind: "$devices" },
      { $count: "logins" },
    ]);
    const totalLogins = totalLoginsResult[0]?.logins || 0;

    const userSentMessagesNotSeen = await Message.countDocuments({
      status: "sent",
      sender: "User",
    });

    return NextResponse.json(
      {
        totalRegistrations,
        totalLogins,
        userSentMessagesNotSeen,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
