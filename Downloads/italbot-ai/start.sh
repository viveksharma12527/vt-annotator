#!/bin/bash

# Function to kill process on a port
kill_port() {
  PORT=$1
  PID=$(lsof -ti:$PORT)
  if [ -n "$PID" ]; then
    echo "Killing process on port $PORT (PID: $PID)..."
    kill -9 $PID
  fi
}

echo "Checking for existing processes..."
kill_port 3001
kill_port 5173

echo "Installing dependencies..."
npm install

echo "Starting Backend Server..."
node server.js &
BACKEND_PID=$!

echo "Starting Frontend Server..."
npm start &
FRONTEND_PID=$!

# Function to kill both processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "Servers are running. Press Ctrl+C to stop."
wait
