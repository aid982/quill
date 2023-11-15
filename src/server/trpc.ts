import { auth } from '@/lib/auth';
import { TRPCError, initTRPC } from '@trpc/server';
 
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
const middleware = t.middleware;
 
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
const isAuth = middleware(async (opts)=>{    
    const session =await auth();
    //console.log(session)
    if(!session) throw new TRPCError({code:"UNAUTHORIZED"})
    const {user} = session;   

    return opts.next({
        ctx:{
            userId:user.id,
            user
        }
    })

})

export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
