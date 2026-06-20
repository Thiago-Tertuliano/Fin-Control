CREATE TABLE `__new_investments` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_type` text NOT NULL,
	`ticker` text,
	`description` text NOT NULL,
	`amount_invested_cents` integer NOT NULL,
	`current_value_cents` integer,
	`quantity` text,
	`purchase_date` text NOT NULL,
	`bank_id` text NOT NULL,
	`notes` text,
	`metadata` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_investments`("id", "asset_type", "ticker", "description", "amount_invested_cents", "current_value_cents", "quantity", "purchase_date", "bank_id", "notes", "metadata", "created_at")
SELECT "id", "asset_type", "ticker", "description", "amount_invested_cents", "current_value_cents", "quantity", "purchase_date", "bank_id", "notes", NULL, "created_at" FROM `investments`;
--> statement-breakpoint
DROP TABLE `investments`;
--> statement-breakpoint
ALTER TABLE `__new_investments` RENAME TO `investments`;
