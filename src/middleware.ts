import { withAuth } from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/navigation";

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
    // If the user is authorized, let the request pass through to next-intl middleware
    function onSuccess(req) {
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token }) => token != null,
        },
        pages: {
            signIn: "/auth/signin",
        },
    }
);

export default function middleware(req: NextRequest) {
    // Exclude API, static files, and other assets from middleware
    const excludePattern = /^\/(api|_next\/static|_next\/image|favicon\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$)/;
    if (excludePattern.test(req.nextUrl.pathname)) return;

    const pathname = req.nextUrl.pathname;

    // Remove locale prefix to check if the path is protected
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, "");

    const isProtected =
        pathnameWithoutLocale.startsWith("/admin") ||
        pathnameWithoutLocale.startsWith("/profile") ||
        pathnameWithoutLocale.startsWith("/add-property");

    if (isProtected) {
        return (authMiddleware as any)(req);
    } else {
        return intlMiddleware(req);
    }
}

export const config = {
    // Match all paths except those that definitely don't need i18n (api, static, etc.)
    matcher: ["/((?!api|_next|.*\\..*).*)"]
};
