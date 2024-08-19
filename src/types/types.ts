import { JWT } from "next-auth/jwt"
import { User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
type UserId = string;
declare module "next-auth" {
  interface Session {
    user: User | AdapterUser & {
      email: string;
      admin?: Boolean;
      id: string;
    };
    accessToken?:string
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {    
    accessTokenExpires?: number,    
    accessToken?:string
    user:User | AdapterUser
  }
}
