// src/app/api/admin/users/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { IUser } from '@/interfaces/IUser'; // Ensure this interface is correctly defined
import { jwtVerify } from "jose";

// Add this line to force the route to be dynamic
export const dynamic = 'force-dynamic';

// Define an interface that extends IUser and includes sentStatsCount
interface UserWithSentStats extends Omit<IUser, 'id'> {
  sentStatsCount: number;
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // Extract the token from the cookies
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 });
    }

    // **Utilize the payload** (e.g., log the user ID or enforce authorization)
    console.log(`Authenticated user ID: ${payload.userId}`);

    // Fetch users along with the count of sent messages (status: "sent")
    const usersWithSentStats: UserWithSentStats[] = await User.aggregate([
      {
        $lookup: {
          from: 'messages', // Ensure this matches the actual collection name in MongoDB
          let: { userId: '$_id' }, // Use ObjectId directly without converting to string
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] }, // Match ObjectId directly
                    { $eq: ['$sender', 'User'] },
                    { $eq: ['$status', 'sent'] }, // Add status filter
                  ],
                },
              },
            },
            { $count: 'sentStatsCount' },
          ],
          as: 'sentStats',
        },
      },
      {
        $addFields: {
          sentStatsCount: {
            $ifNull: [{ $arrayElemAt: ['$sentStats.sentStatsCount', 0] }, 0],
          },
        },
      },
      {
        $project: {
          __v: 0,
          sentStats: 0,
        },
      },
    ]);

    // **Optional:** Further utilize `payload` for authorization (e.g., check user roles)

    return NextResponse.json({ users: usersWithSentStats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
