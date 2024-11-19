// lib/auth.ts
import jwt from 'jsonwebtoken';

// Secret key for JWT (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Interface for JWT payload
interface JwtPayload {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

// Function to verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
};
