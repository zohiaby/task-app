#!/bin/bash
set -e

# Check if schema tables exist
mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" --database="${MYSQL_DATABASE}" -e "SHOW TABLES" | grep -q "shops" || {
  echo "Initializing database schema..."
  mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" --database="${MYSQL_DATABASE}" < /docker-entrypoint-initdb.d/schema.sql
  echo "Schema initialization complete!"
}

# Grant permissions
echo "Configuring MySQL user permissions..."
mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
mysql --user=root --password="${MYSQL_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"
echo "Permissions configured!"