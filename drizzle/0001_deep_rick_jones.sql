CREATE TYPE "public"."category" AS ENUM('VEG', 'NON_VEG');--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"product_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"category" "category" NOT NULL,
	"price" real DEFAULT 10.1 NOT NULL,
	"lister_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_lister_id_user_id_fk" FOREIGN KEY ("lister_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;