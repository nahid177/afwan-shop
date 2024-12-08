import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isRegisterPage = pathname === "/admin/register";

  if (token) {
    const decodedToken = await verifyToken(token);

    if (decodedToken) {
      console.log("Token verified successfully");

      if (isLoginPage || isRegisterPage) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      if (isAdminPage) {
        return NextResponse.next();
      }

      return NextResponse.next();
    } else {
      console.log("Token is invalid or expired, redirecting to /login");
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
  } else {
    if (isAdminPage && !isRegisterPage) {
      console.log("No token found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
