import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { SessionStrategy } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" as SessionStrategy },
};

export default NextAuth(authOptions); 