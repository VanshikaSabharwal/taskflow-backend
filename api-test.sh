#!/bin/bash
# -----------------------------------------------
# TaskFlow API Test Script
# This script demonstrates how to:
# 1. Register a new user
# 2. Log in to get a JWT token
# 3. Create a new project
# 4. Add a task to that project
# -----------------------------------------------

BASE_URL="http://localhost:3000/api"

# --- Step 1: Register a new user ---
echo "Registering user..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123",
    "name": "Demo User"
  }'
echo -e "\n  User registration complete.\n"

# --- Step 2: Login to get JWT token ---
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo " Logged in successfully."
echo "Token: $TOKEN"
echo

# --- Step 3: Create a new project ---
echo "Creating a new project..."
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Demo Project",
    "description": "Project created for API testing"
  }')

echo "Project response: $PROJECT_RESPONSE"
PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "  Project created with ID: $PROJECT_ID"
echo

# --- Step 4: Add a task to the project ---
echo "Creating a new task..."
curl -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Integrate Database\",
    \"description\": \"Connect Prisma with PostgreSQL\",
    \"projectId\": $PROJECT_ID
  }"
echo -e "\n  Task creation complete."
