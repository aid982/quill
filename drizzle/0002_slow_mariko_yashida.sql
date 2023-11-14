ALTER TABLE "file" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "file" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "fileId" SET DATA TYPE text;