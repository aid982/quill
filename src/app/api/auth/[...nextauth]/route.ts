import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {  
  adapter: DrizzleAdapter(db),   
  session: {
    strategy: "jwt", // See https://next-auth.js.org/configuration/nextjs#caveats, middleware (currently) doesn't support the "database" strategy which is used by default when using an adapter (https://next-auth.js.org/configuration/options#session)
  },
  jwt:{
    maxAge: 60 * 60 * 24 * 30,
  },
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
      //console.log('Ses tok',token)
      //console.log(session)
      //console.log(user)
      const data = {
        ...session,
        user:{
          ...token.user!
        },
        
      }
    //  console.log(data)
      
      return data;
    },
    jwt: ({token,user})=>{
      if(user) {        
        token = {
          ...token,
          user:{
            ...user
          }
        }
        
      }      
      return token
      
    }
    
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
