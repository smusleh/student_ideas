#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

echo "==> Installing backend dependencies…"
cd "$BACKEND"
pip install -r requirements.txt -q

echo "==> Running database migrations…"
alembic upgrade head

echo "==> Installing frontend dependencies…"
cd "$FRONTEND"
npm install --silent

echo ""
echo "Starting backend on http://localhost:8000"
echo "Starting frontend on http://localhost:5173"
echo "Press Ctrl+C to stop both."
echo ""

cd "$BACKEND"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
