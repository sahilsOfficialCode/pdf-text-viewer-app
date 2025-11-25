import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

// Build trusted origins list
const trustedOrigins = [
  "http://localhost:3000",
  "https://pdf-text-viewer-app.vercel.app",
  process.env.BETTER_AUTH_URL,
  // Vercel provides VERCEL_URL for preview deployments
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins,
});
