CREATE TABLE `app_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `app_state` (`key`, `value`)
SELECT 'starter_data_initialized',
       CASE WHEN EXISTS (SELECT 1 FROM `algorithms`) THEN '1' ELSE '0' END;
