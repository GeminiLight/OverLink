#!/bin/bash
echo "Starting CV Mirror..."

# Start Backend
echo "Starting Backend on port 8000..."
python server.py &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on port 5600..."
cd frontend
npm run dev -- --port 5600 --host &
FRONTEND_PID=$!

# Handle exit
function cleanup {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
}

trap cleanup EXIT

echo "Services running. Press Ctrl+C to stop."
wait
