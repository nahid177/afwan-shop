// /src/utils/errorHandler.ts

import { NextResponse } from 'next/server';

export const handleError = (error: unknown, message: string, status: number = 500) => {
  console.error(message, error);
  return NextResponse.json(
    { message: message },
    { status }
  );
};
