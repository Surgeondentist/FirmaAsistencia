import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";

function adminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
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
      const allowed = adminEmail();
      if (!allowed || !email || email !== allowed) {
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
  if (!email || email !== adminEmail()) {
    return null;
  }
  return session;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmail();
  return Boolean(allowed && email.trim().toLowerCase() === allowed);
}
