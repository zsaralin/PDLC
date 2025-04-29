#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd /Users/admin/Desktop/pdlc/PDLC/backend/
node server.js &

# Wait a couple seconds to ensure the backend starts before launching the app
sleep 30

# Launch the macOS app
echo "Launching PixelGrid app..."
open /Users/admin/Desktop/pdlc/PDLC/dist/mac-arm64/pixelgrid.app
