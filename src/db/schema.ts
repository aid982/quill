import type { AdapterAccount } from "@auth/core/adapters"
import { sql } from "drizzle-orm";
import { boolean, integer, pgSchema, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from 'uuid';


const createId = ()=>{
  const e= uuidv4()
}

export const users =pgTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  stripePriceId: text("stripePriceId"),  
  stripeSubscriptionId: text("stripeSubscriptionId"),  
  stripeCustomerId  : text("stripeCustomerId"),    
  stripeCurrentPeriodEnd: timestamp("stripeCurrentPeriodEnd", { mode: "date" }),
})



export const files = pgTable("file", {
  id: text('id').primaryKey().notNull().$defaultFn(()=>uuidv4()),  
  name: text("name"),
  uploadStatus:text("uploadStatus",{enum:[
    "PENDING",
    "PROCESSING",
    "FAILED",
    "SUCCESS"
  ]}).default("PENDING"),
  url:text("url"),
  key:text("key"),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state")
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId)
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
   expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token)
  })
)

export const messages = pgTable("messages", {
  id: text('id').primaryKey().notNull().$defaultFn(()=>uuidv4()),
  text: text("text").notNull(),
  isUserMessage:boolean('isUserMessage'),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updateAt: text("updateAt").default(sql`CURRENT_TIMESTAMP`),
  userId: text("userId")  
  .references(() => users.id, { onDelete: "cascade" }),
  fileId: text("fileId")
  .notNull()
  .references(() => files.id, { onDelete: "cascade" }),
  
})