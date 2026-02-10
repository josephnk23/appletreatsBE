CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone_number` varchar(30),
	`profile_image` varchar(500),
	`role` enum('admin','customer') NOT NULL DEFAULT 'customer',
	`status` enum('Active','Inactive','Blocked') NOT NULL DEFAULT 'Active',
	`last_active_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`address` varchar(500) NOT NULL,
	`city` varchar(255) NOT NULL,
	`region` varchar(255) NOT NULL,
	`zip_code` varchar(20) NOT NULL,
	`country` varchar(100) NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`image` varchar(500),
	`href` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category_id` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`original_price` decimal(10,2) NOT NULL,
	`image` varchar(500) NOT NULL,
	`condition` enum('New','Refurbished') NOT NULL DEFAULT 'New',
	`is_new` boolean NOT NULL DEFAULT false,
	`is_best_seller` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`stock` int NOT NULL DEFAULT 0,
	`colors` json,
	`storage_options` json,
	`grades` json,
	`memory_options` json,
	`specs` json,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`image` varchar(500) NOT NULL,
	`selected_options` json,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`customer_id` varchar(36) NOT NULL,
	`shipping_address_id` varchar(36),
	`subtotal` decimal(10,2) NOT NULL,
	`tax` decimal(10,2) NOT NULL DEFAULT '0',
	`shipping_cost` decimal(10,2) NOT NULL DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`status` enum('Processing','Shipped','Out for Delivery','Delivered','Cancelled','Refunded') NOT NULL DEFAULT 'Processing',
	`payment_status` enum('Paid','Pending','Failed','Refunded') NOT NULL DEFAULT 'Pending',
	`tracking_number` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hero_slides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`image` varchar(500) NOT NULL,
	`cta` varchar(100) NOT NULL,
	`href` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `hero_slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promo_banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`cta_text` varchar(100) NOT NULL,
	`cta_link` varchar(255) NOT NULL,
	`bg_color` varchar(20) NOT NULL DEFAULT '#f5f5f7',
	`image` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `promo_banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_shipping_address_id_addresses_id_fk` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses`(`id`) ON DELETE no action ON UPDATE no action;