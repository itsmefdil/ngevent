CREATE TYPE "public"."auth_provider" AS ENUM('email', 'google');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "auth_provider" "auth_provider" DEFAULT 'email' NOT NULL;