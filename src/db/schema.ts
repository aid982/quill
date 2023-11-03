import { integer, sqliteTable, text, primaryKey,SQLiteBoolean} from "drizzle-orm/sqlite-core"
import type { AdapterAccount } from "@auth/core/adapters"
import { sql } from "drizzle-orm";


export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image")
})



export const files = sqliteTable("file", {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
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

export const accounts = sqliteTable(
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

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull()
})

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull()
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token)
  })
)

export const messages = sqliteTable("messages", {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  text: text("name"),
  isUserMessage:integer('isUserMessage',{mode:'boolean'}),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updateAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  userId: text("userId")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" }),
  fileId: integer("fileId")
  .notNull()
  .references(() => files.id, { onDelete: "cascade" }),
  
})