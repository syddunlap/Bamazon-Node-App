DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    stock_quantity INT(10) NOT NULL
    );
    
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("headphones", "electronics", 30.00, 100), ("spatula", "kitchen", 5.95, 450), 
("queen air mattress", "furniture", 349.99, 78), ("coffee mug", "kitchen", 8.95, 250),
("multi colored table lamp", "furniture", 89.99, 100), ("garmin vivoactive 3", "electronics", 350.00, 50),
("blue ceramic plate, set of 2", "kitchen", 10.00, 233), ("white coffee table", "furniture", 124.99, 75),
("large wooden desk", "furniture", 178.99, 40), ("heart rate monitor", "electronics", 99.99, 35);

