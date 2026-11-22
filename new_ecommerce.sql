-- ============================================================
-- new_ecommerce.sql
-- Standalone script: DROP & RECREATE `ecommerce` database.
-- Run this ONCE (phpMyAdmin / mysql CLI) against a fresh MySQL
-- server. It creates the full schema, seeds an admin + customer
-- user, and migrates all legacy product rows from ecommerce.sql.
-- ============================================================

DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20) DEFAULT NULL,
    userimg VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: addresses
-- --------------------------------------------------------
CREATE TABLE addresses (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255) DEFAULT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addresses_user (user_id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: products
-- --------------------------------------------------------
CREATE TABLE products (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(100) DEFAULT NULL,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'sold', 'inactive') NOT NULL DEFAULT 'active',
    seller_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_products_seller (seller_id),
    KEY idx_products_category (category),
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: carts
-- --------------------------------------------------------
CREATE TABLE carts (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_carts_user (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: cart_items
-- --------------------------------------------------------
CREATE TABLE cart_items (
    id INT NOT NULL AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_product (cart_id, product_id),
    KEY idx_cart_items_product (product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: orders
-- --------------------------------------------------------
CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_id INT DEFAULT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_method ENUM('cod', 'online') NOT NULL DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_orders_user (user_id),
    KEY idx_orders_address (address_id),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: order_items
-- --------------------------------------------------------
CREATE TABLE order_items (
    id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    seller_id INT DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    KEY idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: contact_messages (Contact Us form submissions)
-- --------------------------------------------------------
CREATE TABLE contact_messages (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Seed data: users
-- Passwords are real bcryptjs hashes generated via:
--   node -e "console.log(require('bcryptjs').hashSync('Admin@123', 10))"
--   node -e "console.log(require('bcryptjs').hashSync('Customer@123', 10))"
-- id 1 = admin (admin@gmail.com / Admin@123)
-- id 2 = customer (customer@gmail.com / Customer@123)
-- --------------------------------------------------------
INSERT INTO users (id, name, email, password, role, phone, userimg) VALUES
(1, 'Admin', 'admin@gmail.com', '$2b$10$BQ.mDOWr3KUQnhDZzTWEmeZE5l/Blo0GckKx85nbEDAHTpIoeM9e2', 'admin', NULL, NULL),
(2, 'Customer', 'customer@gmail.com', '$2b$10$H7U85icS1ThSksK2ramLpOUcVxsxail/giHyx29LKxRNL6H2XqWPa', 'customer', NULL, NULL);

-- --------------------------------------------------------
-- Migrated product data from ecommerce.sql
-- seller_id reassigned: old 18 -> 1 (admin), old 9 -> 2 (customer)
-- Prices kept as-is (not converted).
-- --------------------------------------------------------
INSERT INTO products (id, name, description, price, stock, category, image, status, seller_id, created_at) VALUES
(6, 'UrbanFlex Jogger Shoes', 'Step into all-day comfort and modern style with our UrbanFlex Jogger Shoes. Designed for active lifestyles, these joggers feature a lightweight, breathable mesh upper, cushioned memory foam insoles, and a durable rubber outsole for superior traction. Whether you\'re running errands or hitting the gym, these versatile shoes offer the perfect blend of fashion and function. Available in multiple colors to match your vibe and tide.', 233, 6, 'Shoes', '/products/1747054322115.webp', 'active', 1, '2025-05-12'),
(7, 'Black Mukeshan Shoes', 'everyday look with the timeless  Black Mukeshan Shoes. Crafted with high-quality synthetic leather, these shoes feature a sleek black finish, breathable inner lining, and cushioned insoles for all-day comfort. Perfect for formal events, office wear, or smart casual outings, Mukeshan shoes blend traditional craftsmanship with modern design. Durable, stylish, and versatile — a must-have for every ', 16, 2, 'Shoes', '/products/1747054401773.jfif', 'active', 1, '2025-05-12'),
(8, 'Red Joggers', 'Step up your streetwear game with these bold and stylish Red Joggers. Designed for both comfort and performance, they feature a lightweight, breathable mesh upper and cushioned soles for maximum support during every step. Whether you\'re hitting the gym, running errands, or hanging out with friends, these joggers deliver all-day comfort with a sporty edge. The vibrant red color adds a statement touch to any outfit.', 300, 5, 'Shoes', '/products/1747054528072.jfif', 'active', 1, '2025-05-12'),
(9, 'green pants', 'Elevate your everyday look with these stylish olive green pants. Crafted from a breathable cotton blend, these pants offer all-day comfort with a sleek, modern fit. Whether you\'re dressing up for a casual outing or keeping it relaxed at home, their versatile color and tapered design make them a wardrobe essential. Pair with a plain tee or button-down for an effortlessly sharp outfit.', 30, 25, 'Clothing', '/products/1747056055306.jfif', 'active', 2, '2025-05-12'),
(10, 'Blue Shirt', 'Add a touch of sophistication to your wardrobe with this classic sky blue shirt. Made from soft, breathable cotton fabric, it offers a perfect blend of comfort and style. The tailored fit, button-down collar, and clean finish make it ideal for both office wear and smart-casual outings. Easy to pair with jeans or trousers, this shirt brings a polished look to any occasion.', 25, 10, 'Clothing', '/products/1747056235098.jfif', 'active', 1, '2025-05-12'),
(11, 'Grey headphones', 'Designed for comfort and clarity, they offer deep bass, crisp highs, and noise isolation—perfect for music, calls, and gaming.', 15, 1, 'Accessories', '/products/1747144241492.jfif', 'active', 1, '2025-05-12'),
(12, 'Iphone 16 pro max', 'Experience the future with the iPhone 16 Pro Max, Apple\'s most advanced smartphone yet. Featuring a stunning 6.9-inch Super Retina XDR display, the new titanium design combines strength with lightweight elegance. Powered by the next-gen A18 Bionic chip, it delivers unmatched speed and efficiency for everything from gaming to pro-level photography.', 800, 11, 'mobile', '/products/1747056862011.jfif', 'active', 1, '2025-05-12'),
(13, 'Laptop', 'Powerful Performance. Sleek Design. Reliable Laptop for Everyday Use. Upgrade your work, study, or entertainment experience with this high-performance laptop.', 200, 4, 'Electronics', '/products/1747056926891.jpg', 'active', 1, '2025-05-12'),
(14, 'Honda Bike 150 cc', 'Ride in Style and Comfort with Our Premium Bike Collection. Experience the thrill of the open road with our top-quality bike, designed for both comfort and durability.', 100, 1, 'vehicle', '/products/1747056991336.jfif', 'active', 1, '2025-05-12'),
(15, 'Honda civic 11 gen', 'Drive into the Future with Our Latest Car Collection. Unleash the power of performance and style with our state-of-the-art car.', 900, 12, 'vehicle', '/products/1747057052769.jfif', 'active', 1, '2025-05-12'),
(16, 'running mashine', 'Achieve Your Fitness Goals with the Ultimate Running Machine. Transform your fitness routine with our premium running machine.', 75, 7, 'Health & Fitness', '/products/1747057511440.jfif', 'active', 2, '2025-05-12'),
(17, 'Dumbel', 'Elevate your strength training routine with our high-quality dumbbells, designed to help you build muscle, increase endurance, and enhance overall fitness.', 20, 8, 'Health & Fitness', '/products/1747057563929.jfif', 'active', 2, '2025-05-12'),
(18, 'wheat 50kgs', 'Pure and Nutritious Wheat Packet - Premium Quality. Bring home the goodness of whole wheat with our premium wheat packet.', 20, 70, 'Groceries', '/products/1747057635727.jfif', 'active', 2, '2025-05-12'),
(19, 'Rice 20kgs', 'Premium Quality Rice – Pure, Fresh, and Nutritious. Our Premium Rice is carefully sourced from the finest rice fields.', 30, 100, 'Groceries', '/products/1747057736330.jfif', 'active', 2, '2025-05-12'),
(20, 'Eggs', 'Farm Fresh Eggs – Nutritious, Healthy, and Delicious. Our Farm Fresh Eggs are sourced from free-range hens.', 10, 400, 'Groceries', '/products/1747057765207.jfif', 'active', 2, '2025-05-12'),
(21, 'Milk', 'Fresh Cow\'s Milk – Pure, Nutritious, and Delicious. Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows.', 5, 4000, 'Groceries', '/products/1747057807039.jfif', 'active', 2, '2025-05-12'),
(22, 'Little women book', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 10, 9, 'Books & Stationery', '/products/1747057875679.jfif', 'active', 2, '2025-05-12'),
(23, 'Harry potter book', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 19, 20, 'Books & Stationery', '/products/1747057906362.jfif', 'active', 2, '2025-05-12'),
(24, 'pencils', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 12, 22, 'Books & Stationery', '/products/1747057934455.jfif', 'active', 2, '2025-05-12'),
(25, 'Bat', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 40, 200, 'Sports & Outdoors', '/products/1747057958329.jfif', 'active', 2, '2025-05-12'),
(26, 'Shetels', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 4, 900, 'Sports & Outdoors', '/products/1747057991560.jfif', 'active', 2, '2025-05-12'),
(27, 'Football', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 60, 200, 'Sports & Outdoors', '/products/1747058023554.jfif', 'active', 2, '2025-05-12'),
(28, 'Serum', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 20, 200, 'Beauty & Personal Care', '/products/1747058114585.jfif', 'active', 2, '2025-05-12'),
(29, 'Sunblock', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 20, 233, 'Beauty & Personal Care', '/products/1747058135547.jfif', 'active', 2, '2025-05-12'),
(30, 'Whitening cream', 'Our Fresh Cow\'s Milk is sourced from healthy, grass-fed cows to bring you the purest, most nutritious milk.', 22, 289, 'Beauty & Personal Care', '/products/1747058175560.jfif', 'active', 2, '2025-05-12'),
(33, 'Air Conditioner', 'Premium quality air conditioner for home and office cooling needs.', 1222, 22, 'Beauty & Personal Care', '/products/1747144448208.jfif', 'active', 2, '2025-05-13');

ALTER TABLE products AUTO_INCREMENT = 41;
ALTER TABLE users AUTO_INCREMENT = 3;

SET FOREIGN_KEY_CHECKS = 1;
