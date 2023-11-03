import { db } from "@/lib/db";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { files, messages, users } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  getUsers: publicProcedure.query(async () => {
    return await db.select().from(users).all();
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const data = await db
      .select()
      .from(files)
      .where(sql`${files.userId} = ${userId}`);
    return data;
  }),
  getFileMessages: privateProcedure.input(z.object({
    limit:z.number().min(1).max(100).nullish(),
    cursor:z.number().nullish(),
    fileId:z.number()

  })).query(async ({ ctx,input }) => {
    const { userId } = ctx;
    const {cursor,fileId} = input;
    const  limit = input.limit ?? 10;
    const data = await db
      .select()
      .from(messages)
      .where(sql`${messages.userId} = ${userId} and ${messages.fileId} = ${fileId} ${cursor ? ` offset ${cursor}`:''}`).limit(limit+1).orderBy(desc(messages.createdAt));
    console.log(data);  
    let nextCursor: typeof cursor |undefined;
    return data;
  }),
  getFileUploadStatus: privateProcedure
    .input(
      z.object({
        fileId: z.number(),
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
        id: z.number(),
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
