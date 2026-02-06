import AuthentikProvider from "next-auth/providers/authentik";

export const authOptions = {
  providers: [
    AuthentikProvider({
      clientId: process.env.AUTHENTIK_CLIENT_ID,
      clientSecret: process.env.AUTHENTIK_CLIENT_SECRET,
      issuer: process.env.AUTHENTIK_ISSUER_URL,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Behind Cloudflare/Coolify proxy
  trustHost: true,
};
