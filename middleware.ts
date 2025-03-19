import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Handle dashboard routes - protecting them
  if (path.startsWith("/dashboard") || path.startsWith("/code-playground")) {
    try {
      // Get the JWT token directly
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If no token found, redirect to login
      if (!token) {
        const url = new URL("/", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }

      // Optional: Check if the user is active
      if (token.active === false) {
        // Redirect inactive users to a verification page
        return NextResponse.redirect(new URL("/verify", req.url));
      }
    } catch (error) {
      console.error("Authentication middleware error:", error);
      // In case of error, redirect to login
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Handle root path - redirect logged-in and verified users to dashboard
  if (path === "/") {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // If user is logged in and active, redirect to dashboard
      if (token && token.active !== false) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error("Root path middleware error:", error);
      // In case of error, continue to the root page
    }
  }

  return NextResponse.next();
}

// Define which paths this middleware should run for
export const config = {
  matcher: ["/", "/dashboard/:path*", "/code-playground/:path*"],
};
