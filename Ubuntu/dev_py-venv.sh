#!/bin/bash

# Script to automate local development venv execution

# Terminal 1: Backend VENV Start
# We chain the commands together. 'exec bash' keeps the terminal open after the command finishes or fails.
gnome-terminal --working-directory="/home/michael/Projects/Scheduling-SaaS/backend" -- bash -c "echo 'Executing Backend VENV...'; source venv/bin/activate; cd main_project; exec bash"

echo "Development startup script executed."

