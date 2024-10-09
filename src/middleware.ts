import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Import jwtVerify from jose

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSecretKey"); // Encode your secret key

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET); // Verify the token
    return payload;
  } catch (error) {
    // Error handling for token verification
    if (error instanceof Error) {
      console.error("Token verification error:", error.message);
    } else {
      console.error("Unknown error during token verification");
    }
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Define paths
  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isRegisterPage = pathname === "/admin/register";

  if (token) {
    const decodedToken = await verifyToken(token);

    // Token verified successfully
    if (decodedToken) {
      console.log("Token verified successfully");

      // Redirect to admin if logged-in user tries to access login/register pages
      if (isLoginPage || isRegisterPage) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      // Allow access to admin pages if token is valid
      if (isAdminPage) {
        return NextResponse.next();
      }

      // Continue to the requested page
      return NextResponse.next();
    } else {
      // Token is invalid or expired
      console.log("Token is invalid or expired, redirecting to /login");
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token"); // Clear invalid token
      return response;
    }
  } else {
    // No token found
    if (isAdminPage && !isRegisterPage) {
      console.log("No token found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If no token and not accessing admin page, continue to requested page
    return NextResponse.next();
  }
}

// Apply this middleware to all admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
