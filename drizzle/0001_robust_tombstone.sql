ALTER TABLE "quill"."messages" ALTER COLUMN "fileId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "quill"."account" SET SCHEMA public;
--> statement-breakpoint
ALTER TABLE "quill"."file" SET SCHEMA public;
--> statement-breakpoint
ALTER TABLE "quill"."messages" SET SCHEMA public;
--> statement-breakpoint
ALTER TABLE "quill"."session" SET SCHEMA public;
--> statement-breakpoint
ALTER TABLE "quill"."user" SET SCHEMA public;
--> statement-breakpoint
ALTER TABLE "quill"."verificationToken" SET SCHEMA public;
--> statement-breakpoint
DROP SCHEMA "quill";
