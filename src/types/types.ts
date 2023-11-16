import { User } from "next-auth"
type UserId = string
declare module "next-auth" {
    interface Session {
      user: User & {        
        email:string
        admin:Boolean
        id:string
      },      
    }
    

  }