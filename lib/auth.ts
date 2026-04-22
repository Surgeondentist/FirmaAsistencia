import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";

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
    async jwt({ token, account, profile }) {
      if (
        account?.provider === "google" &&
        profile &&
        typeof profile === "object" &&
        "sub" in profile &&
        typeof (profile as { sub?: unknown }).sub === "string"
      ) {
        token.sub = (profile as { sub: string }).sub;
      }
      return token;
    },
    async session({ session, token }) {
      const sub = typeof token.sub === "string" ? token.sub.trim() : "";
      if (session.user && sub) {
        session.user.id = sub;
      }
      return session;
    },
    async signIn({ user }) {
      return Boolean(user?.email?.trim());
    },
  },
  pages: {
    signIn: "/admin",
  },
};

/**
 * Sesión válida para el panel: Google con email y `sub` en sesión (`user.id`).
 */
export async function getOwnerSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim();
  const id = session?.user?.id?.trim();
  if (!email || !id) {
    return null;
  }
  return session;
}
