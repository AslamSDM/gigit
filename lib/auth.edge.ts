import NextAuth from "next-auth";

/**
 * Edge-compatible auth configuration for middleware.
 * This is a separate configuration that doesn't include the Prisma adapter
 * since the adapter uses Node.js modules not available in Edge runtime.
 * 
 * Note: This only needs the session configuration to check if user is authenticated.
 */
export const { auth: authEdge } = NextAuth({
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Share the same secret as the main auth config
  secret: process.env.AUTH_SECRET,
});
