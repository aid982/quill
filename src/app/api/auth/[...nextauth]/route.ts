import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,

      // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {      
      const data = {
        ...session,
        user:{
          ...user
        }
      }
      
      return data;
    },
    async signIn({ user, account, profile, email, credentials }) {
      let isAllowedToSignIn;
      if (!user.email) return false;
     /* const data = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email));
      console.log(data);
      if (data && data.length > 0)
      */
      isAllowedToSignIn = true;

      console.log(isAllowedToSignIn)

      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
