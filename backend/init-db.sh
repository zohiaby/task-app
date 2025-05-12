#!/bin/bash

echo "Initializing Vendor Shop Management Database..."

# Create database if it doesn't exist
mysql -h localhost -P 3307 -u root -ppassword -e "CREATE DATABASE IF NOT EXISTS vendor_shop_management;"

# Use the database and execute the schema
mysql -h localhost -P 3307 -u root -ppassword vendor_shop_management < ./config/init/schema.sql

if [ $? -eq 0 ]; then
  echo "Database initialized successfully!"
else
  echo "Failed to initialize database."
fi