#!/bin/bash

# Check if openssl is installed
if ! command -v openssl &> /dev/null
then
    echo "Error: openssl could not be found. Please install openssl and try again."
    exit 1
fi

# Generate a self-signed certificate and private key
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

if [[ $? -eq 0 ]]; then
    echo "Successfully generated self-signed certificate (cert.pem) and private key (key.pem)."
else
    echo "Error generating self-signed certificate."
fi

python3 app.py
