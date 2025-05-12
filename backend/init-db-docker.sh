#!/bin/bash

echo "Initializing Vendor Shop Management Database..."
echo "This script will create the necessary database and tables using the Docker MySQL container"

# Create the database if it doesn't exist and initialize the schema
docker exec backend-mysql-1 mysql -uroot -ppassword -e "
CREATE DATABASE IF NOT EXISTS vendor_shop_management;
USE vendor_shop_management;
" || { echo "Failed to create database"; exit 1; }

# Load the schema SQL into the container
echo "Loading schema file into the MySQL container..."
docker exec -i backend-mysql-1 mysql -uroot -ppassword vendor_shop_management < ./config/init/schema.sql || { 
  echo "Failed to load schema"; 
  exit 1; 
}

echo "✅ Database initialized successfully!"
echo "You can now run the application with: node server.js"