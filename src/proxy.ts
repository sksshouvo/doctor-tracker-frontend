import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login"];

/**
 * Route guard before render. The `dt_session` marker cookie carries no secret; it only avoids a flash of
 * protected UI. Real authorisation is enforced by the API (401) and <AuthGate>.
 */
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has("dt_session");
  const { pathname, search } = req.nextUrl;
  if (!hasSession && !PUBLIC.includes(pathname)) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname + search)}`, req.url),
    );
  }
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"],
};
