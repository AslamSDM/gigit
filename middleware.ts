import { authEdge } from "@/lib/auth.edge";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/register/worker",
  "/register/business",
  "/jobs",
];

// Route patterns that are public (using startsWith)
const publicPatterns = [
  "/jobs/", // Job detail pages
  "/api/jobs", // Jobs API (GET is public)
  "/api/skills", // Skills API for filters
  "/api/auth", // Auth API
];

// Routes that require authentication
const protectedPatterns = [
  "/dashboard",
  "/profile",
  "/applications",
  "/messages",
  "/saved-jobs",
  "/business",
  "/notifications",
  "/contracts",
  "/workers",
  "/onboarding",
];

export default authEdge((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicPattern = publicPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  );

  // Allow public routes and patterns
  if (isPublicRoute || isPublicPattern) {
    return NextResponse.next();
  }

  // Check if the route needs protection
  const isProtectedRoute = protectedPatterns.some((pattern) =>
    pathname.startsWith(pattern)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
