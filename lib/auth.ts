import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";

/** Correos permitidos para el panel; `ADMIN_EMAIL` con varios separados por coma o punto y coma. */
function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL ?? "";
  return raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const allowed = parseAdminEmails();
  return allowed.length > 0 && allowed.includes(normalized);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid https://www.googleapis.com/auth/userinfo.email",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email || !isAllowedAdminEmail(email)) {
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/admin",
  },
};

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email || !isAllowedAdminEmail(email)) {
    return null;
  }
  return session;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return isAllowedAdminEmail(email);
}
