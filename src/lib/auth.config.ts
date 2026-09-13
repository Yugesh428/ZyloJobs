/**
 * Edge-safe auth config — no DB imports, no bcrypt.
 * Used by both middleware (Edge) and the full auth handler (Node.js).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  basePath: "/api/auth",
  trustHost: true,          // required for Auth.js v5 / Next.js 15+
  providers: [],            // Credentials provider added in src/auth.ts (Node only)
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id   = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
};
