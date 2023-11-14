import { db } from "@/lib/db";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { files, messages, users } from "@/db/schema";
import { SQL, and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteURL } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const appRouter = router({

  createStripeSession:privateProcedure   
    .mutation(async ({ ctx}) => {
      const { userId } = ctx;
      console.log(userId)
      const billingUrl = absoluteURL("/dashboard/billing");
      if(!userId) throw new TRPCError({code:"UNAUTHORIZED"});
      
      const dbUsers = await db.select().from(users).where(eq(users.id,userId));
      if(dbUsers.length===0) throw new TRPCError({code:"UNAUTHORIZED"});
      const dbUser = dbUsers[0];
      console.log(dbUser)

      const subscriptionPlan = await getUserSubscriptionPlan();

      if(subscriptionPlan.isSubscribed&&dbUser.stripeCustomerId) {
          const stripeSession = await stripe.billingPortal.sessions.create({
            customer:dbUser.stripeCustomerId,
            return_url:billingUrl
          })

          return {url:stripeSession.url}
      }

      try {       
        const data = PLANS.find((plan)=>plan.name ==="PRO")?.price.priceIds.test;
        console.log(data)

        const stripeSession = await stripe.checkout.sessions.create({
          success_url:billingUrl,
          cancel_url:billingUrl,
          payment_method_types:["paypal","card"],
          mode:"subscription",
          billing_address_collection:"auto",
          line_items:[{
            price:`price_1O9VqcCANakAvoGMHeJUBXPc`,                      
            quantity:1            
          }],
          metadata:{
            userId:userId
          }
          
        })
  
        console.log(stripeSession)
  
        return {url:stripeSession.url}
        
      } catch (error) {
        console.log(error)

        
      }
      return {url:""}

     


      


      
   }), 

  getUsers: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const data = await db
      .select()
      .from(files)
      .where(sql`${files.userId} = ${userId}`);
    return data;
  }),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.object({ id: z.string(), date: z.string() }).nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { cursor, fileId } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      console.log(limit);      
       const where: SQL[] = [] 

       where.push(eq(messages.userId, userId));
       where.push(eq(messages.fileId, fileId));       
       if(cursor) {
        where.push(sql`${messages.createdAt}<${cursor.date} or (${messages.createdAt}=${cursor.date} and ${messages.id}<${cursor.id})`);
       }

      try {
        const data = await db
          .select()
          .from(messages)
          .where(and(...where))
          .limit(limit + 1)
          .orderBy(desc(messages.createdAt), desc(messages.id));

        console.log(data);

        let nextCursor: typeof cursor | undefined;

        if (data.length > limit) {
          const nextMessage = data.pop();
          nextCursor = { id: nextMessage!.id, date: nextMessage!.createdAt };
        }
        return { data, nextCursor };
      } catch (error) {
        console.log(error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const filesArray = await db
        .select()
        .from(files)
        .where(and(eq(files.id, input.fileId), eq(files.userId, userId)));

      if (filesArray.length === 0) {
        return { status: "PENDING" as const };
      }
      return { status: filesArray[0].uploadStatus };
    }),
  getFile: privateProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db
        .select()
        .from(files)
        .where(and(eq(files.key, input.key), eq(files.userId, userId)));
      if (file.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      console.log(file);
      return file[0];
    }),
  deleteFile: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const data = db
        .delete(files)
        .where(and(eq(files.id, input.id), eq(files.userId, userId)))
        .returning({ deletingID: files.id });
      console.log(data);
      return data;
    }),
});

export type AppRouter = typeof appRouter;
