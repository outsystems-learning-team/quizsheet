// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// ベーシック認証のユーザ名・パスは .env.local に
const user = process.env.BASIC_AUTH_USER;
const pass = process.env.BASIC_AUTH_PASSWORD;

// paths を制限したい場合は matcher で指定できます
export const config = {
  matcher: ["/((?!_next).*)"],
};

export function middleware(req: NextRequest) {
  if (!user || !pass) {
    console.warn("BASIC_AUTH_USER/PASSWORD が未設定です");
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    // Edge Runtime では Buffer が使えないので atob でデコード
    if (
      scheme === "Basic" &&
      atob(encoded) === `${user}:${pass}`
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("認証が必要です", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="Enter credentials"` },
  });
}
