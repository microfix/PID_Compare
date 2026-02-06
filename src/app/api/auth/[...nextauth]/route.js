import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Ensure NextAuth runs in Node runtime (not Edge)
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
