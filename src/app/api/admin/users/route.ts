import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();

  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersWithSentStats = await User.aggregate([
      {
        $lookup: {
          from: 'messages',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$sender', 'User'] },
                    { $eq: ['$status', 'sent'] },
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
