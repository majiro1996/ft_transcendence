#!/bin/bash

#load .env file
set -o allexport
source .env

# List of environment variables to include in frontenv.js
env_vars=("BACKEND_API_URL" "BACKEND_PORT" )

# Create or overwrite the frontenv.js file
echo "// Environment variables" > app/frontend/js/frontenv.js

# Loop through each environment variable and write it to frontenv.js
for var in "${env_vars[@]}"; do
  value=$(printenv $var)
  if [ -n "$value" ]; then
    echo "const $var = \"$value\";" >> app/frontend/js/frontenv.js
  fi
done
