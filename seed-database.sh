#!/bin/bash

# Script to seed the database with initial data
# This fixes the "Failed to fetch" error when creating tools

echo "🌱 Seeding database with initial data..."

# Navigate to backend directory
cd backend

# Run database migrations (if needed)
echo "📦 Running database migrations..."
php artisan migrate --force

# Run database seeders
echo "🌱 Running database seeders..."
php artisan db:seed --force

echo "✅ Database seeding completed!"
echo ""
echo "The following data has been added:"
echo "- Users (6 users with different roles)"
echo "- Categories (6 categories for AI tools)"
echo "- Tags (12 tags for AI tools)"
echo "- AI Tools (2 sample tools)"
echo ""
echo "You can now create new AI tools without getting 'Failed to fetch' errors."
