#!/bin/sh

# List of environment variables to include in frontenv.js
env_vars="BACKEND_API_URL BACKEND_PORT"

# Create or overwrite the frontenv.js file
echo "// Environment variables" > /usr/share/nginx/html/js/frontenv.js

# Loop through each environment variable and write it to frontenv.js
for var in $env_vars; do
  value=$(printenv $var)
  if [ -n "$value" ]; then
    echo "const $var = \"$value\";" >> /usr/share/nginx/html/js/frontenv.js
  fi
done

# Start the Nginx server
nginx -g "daemon off;"