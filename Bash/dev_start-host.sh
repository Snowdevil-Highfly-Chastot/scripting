#!/bin/bash

# Script to automate local development startup by opening three terminals
# with specific commands for frontend, backend, and Stripe webhook.

# Terminal 1: Frontend (npm run serve)
# We use --working-directory to start in the correct path
# and execute the command using bash -c '...'
gnome-terminal --working-directory="/home/michael/Projects/Scheduling-SaaS/frontend" -- bash -c "echo 'Starting Frontend...'; npm run serve; exec bash"

# Terminal 2: Backend (uvicorn)
# We chain the commands together. 'exec bash' keeps the terminal open after the command finishes or fails.
gnome-terminal --working-directory="/home/michael/Projects/Scheduling-SaaS/backend" -- bash -c "echo 'Starting Backend...'; source venv/bin/activate; cd main_project; uvicorn main_project.asgi:application --reload --host 0.0.0.0; exec bash"

# Terminal 3: Stripe Webhook (stripe listen)
gnome-terminal --working-directory="/home/michael/Projects/Scheduling-SaaS/backend" -- bash -c "echo 'Starting Stripe Listener...'; stripe listen --forward-to http://127.0.0.1:8000/api/billing/stripe/webhook/; exec bash"

echo "Development startup script executed."

