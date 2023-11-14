import { db } from "@/lib/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// This will run migrations on the database, skipping the ones already applied
const migrateFn = async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
};
migrateFn();

// Don't forget to close the connection, otherwise the script will hang
