// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { SignJWT } from "jose";
import { compare } from "bcrypt"; // assuming passwords are hashed with bcrypt

// Ensure JWT_SECRET is defined in .env
const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKeyHere";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 }
      );
    }

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Verify the password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // Create a JWT token
    // NOTE: Adjust the `payload` as needed. Usually, store userId, roles, etc.
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d") // token expires in 1 day, adjust as needed
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          username: user.username,
        },
      },
      { status: 200 }
    );

    // Set the cookie in the response
    response.cookies.set("token", token, {
      httpOnly: true,                        // Not accessible via client-side JS
      secure: process.env.NODE_ENV === "production",  // Use HTTPS in production
      path: "/",                             // Cookie is valid for entire site
      sameSite: "strict",                    // Protect against CSRF
      maxAge: 60 * 60 * 24,                  // 1 day expiration (in seconds)
    });

    return response;

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
