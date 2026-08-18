CREATE TABLE `algorithms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`language` text NOT NULL,
	`complexity` text NOT NULL,
	`description` text NOT NULL,
	`code` text NOT NULL,
	`tags` text NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
