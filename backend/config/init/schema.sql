-- Initialize vendor shop management database

-- Create location_types table for storing the hierarchy levels
CREATE TABLE IF NOT EXISTS `location_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `level_order` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create locations table for storing location values
CREATE TABLE IF NOT EXISTS `locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `location_type_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `parent_location_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_locations_location_types_idx` (`location_type_id` ASC),
  INDEX `fk_locations_parent_location_idx` (`parent_location_id` ASC),
  CONSTRAINT `fk_locations_location_types`
    FOREIGN KEY (`location_type_id`) REFERENCES `location_types` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_locations_parent_location`
    FOREIGN KEY (`parent_location_id`) REFERENCES `locations` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create shops table
CREATE TABLE IF NOT EXISTS `shops` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('Retailer', 'Wholesale') NOT NULL,
  `latitude` DECIMAL(10,8) NOT NULL,
  `longitude` DECIMAL(11,8) NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_shops_type` (`type` ASC),
  INDEX `idx_shops_status` (`status` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create shop_locations table for mapping shops to locations
CREATE TABLE IF NOT EXISTS `shop_locations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `shop_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_shop_location` (`shop_id` ASC, `location_id` ASC),
  INDEX `fk_shop_locations_shops_idx` (`shop_id` ASC),
  INDEX `fk_shop_locations_locations_idx` (`location_id` ASC),
  CONSTRAINT `fk_shop_locations_shops`
    FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_shop_locations_locations`
    FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default location types
INSERT INTO `location_types` (`name`, `level_order`) VALUES
('Country', 1),
('State', 2),
('City', 3),
('Area', 4),
('Street', 5)
ON DUPLICATE KEY UPDATE `level_order` = VALUES(`level_order`);