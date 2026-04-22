import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      /** Google `sub` (identificador estable del usuario). */
      id: string;
    };
  }
}
