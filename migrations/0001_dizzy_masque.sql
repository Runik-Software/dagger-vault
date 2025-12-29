CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user_campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "resources" CASCADE;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hitpoints" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hope" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "stress" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "armour_slots" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "gold" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_campaign" ADD CONSTRAINT "user_campaign_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_campaign" ADD CONSTRAINT "user_campaign_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;