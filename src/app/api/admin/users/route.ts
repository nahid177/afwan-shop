// src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { IUser } from '@/interfaces/IUser'; // Ensure this interface is correctly defined

// Define an interface that extends IUser and includes sentStatsCount
interface UserWithSentStats extends Omit<IUser, 'id'> {
  sentStatsCount: number;
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

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

    return NextResponse.json({ users: usersWithSentStats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
