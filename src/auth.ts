/**
 * Full auth — Node.js runtime only.
 * Imported by the API route handler and server components.
 * Never import from middleware.ts (Edge runtime).
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { Admin } from "@/lib/models/Admin";
import { syncDB } from "@/lib/sync";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Ensure DB + models are ready before querying
          await syncDB();

          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          if (!email || !password) return null;

          const admin = await Admin.findOne({ where: { email } });
          if (!admin) {
            console.log(`❌ No admin found with email: ${email}`);
            return null;
          }

          const valid = await bcrypt.compare(password, admin.password);
          if (!valid) {
            console.log(`❌ Wrong password for: ${email}`);
            return null;
          }

          console.log(`✅ Admin logged in: ${email}`);
          return {
            id:    String(admin.id),
            name:  admin.name,
            email: admin.email,
            role:  "admin",
          };
        } catch (err) {
          console.error("❌ Auth error:", err);
          return null;
        }
      },
    }),
  ],
});
