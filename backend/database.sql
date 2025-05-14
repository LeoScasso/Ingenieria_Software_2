PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "admins" (
	"admin_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"mail"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	PRIMARY KEY("admin_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "cancellations_policies" (
	"policy_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	"description"	TEXT NOT NULL,
	PRIMARY KEY("policy_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "branches" (
	"branch_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"address"	TEXT NOT NULL,
	"locality"	TEXT NOT NULL,
	PRIMARY KEY("branch_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "car_brands" (
	"brand_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("brand_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "car_models" (
	"model_id"	INTEGER NOT NULL UNIQUE,
	"brand_id"	INTEGER,
	"name"	TEXT NOT NULL,
	"year"	INTEGER NOT NULL,
	PRIMARY KEY("model_id" AUTOINCREMENT),
	FOREIGN KEY("brand_id") REFERENCES "car_brands"("brand_id")
);
CREATE TABLE IF NOT EXISTS "employees" (
	"employee_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"last_name"	TEXT NOT NULL,
	"dni"	INTEGER NOT NULL,
	"mail"	TEXT NOT NULL UNIQUE,
	"phone_number"	INTEGER NOT NULL,
	"password"	INTEGER NOT NULL,
	"branch_id"	INTEGER,
	PRIMARY KEY("employee_id" AUTOINCREMENT),
	FOREIGN KEY("branch_id") REFERENCES "branches"("branch_id") ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS "packages" (
	"package_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	"price"	REAL NOT NULL,
	PRIMARY KEY("package_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "rental_packages" (
	"rental_id"	INTEGER,
	"package_id"	INTEGER,
	PRIMARY KEY("package_id","rental_id"),
	FOREIGN KEY("package_id") REFERENCES "packages"("package_id"),
	FOREIGN KEY("rental_id") REFERENCES "rentals"("rental_id")
);
CREATE TABLE IF NOT EXISTS "rentals" (
	"rental_id"	INTEGER NOT NULL UNIQUE,
	"pickup_datetime"	TEXT NOT NULL,
	"return_date"	TEXT NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"vehicle_number_plate"	INTEGER NOT NULL,
	"vehicle_brand"	TEXT NOT NULL,
	"vehicle_model"	TEXT NOT NULL,
	"vehicle_year"	INTEGER NOT NULL,
	"cost"	REAL NOT NULL,
	PRIMARY KEY("rental_id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "users"("user_id")
);
CREATE TABLE IF NOT EXISTS "reviews" (
	"review_id"	INTEGER NOT NULL UNIQUE,
	"commentary"	TEXT,
	"rating"	INTEGER NOT NULL,
	"user_id"	INTEGER NOT NULL,
	"vehicle_model_id"	INTEGER NOT NULL,
	"vehicle_brand_id"	INTEGER NOT NULL,
	"vehicle_number_plate"	INTEGER NOT NULL,
	PRIMARY KEY("review_id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "users"("user_id"),
	FOREIGN KEY("vehicle_brand_id") REFERENCES "car_brands"("brand_id"),
	FOREIGN KEY("vehicle_model_id") REFERENCES "car_models"("model_id")
);
CREATE TABLE IF NOT EXISTS "users" (
	"user_id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL,
	"last_name"	TEXT NOT NULL,
	"dni"	INTEGER NOT NULL,
	"mail"	TEXT NOT NULL UNIQUE,
	"phone_number"	INTEGER NOT NULL,
	"password"	INTEGER NOT NULL,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "vehicles" (
	"vehicle_id"	INTEGER NOT NULL UNIQUE,
	"number_plate"	TEXT NOT NULL UNIQUE,
	"model_id"	INTEGER NOT NULL,
	"capacity"	INTEGER NOT NULL,
	"price_per_day"	REAL NOT NULL,
	"minimum_rental_days"	INTEGER NOT NULL,
	"cancellation_policy_id"	INTEGER NOT NULL,
	PRIMARY KEY("vehicle_id" AUTOINCREMENT),
	FOREIGN KEY("cancellation_policy_id") REFERENCES "cancellations_policies"("policy_id"),
	FOREIGN KEY("model_id") REFERENCES "car_models"("model_id")
);
INSERT INTO sqlite_sequence VALUES('cancellations_policies',0);
INSERT INTO sqlite_sequence VALUES('car_models',0);
INSERT INTO sqlite_sequence VALUES('employees',0);
INSERT INTO sqlite_sequence VALUES('packages',0);
INSERT INTO sqlite_sequence VALUES('rentals',0);
INSERT INTO sqlite_sequence VALUES('reviews',0);
INSERT INTO sqlite_sequence VALUES('users',0);
INSERT INTO sqlite_sequence VALUES('vehicles',0);
COMMIT;
