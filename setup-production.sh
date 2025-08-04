#!/bin/bash

# PawMatch Production Setup Script
# This script sets up the production database with Bengali pet data

echo "🐾 Setting up PawMatch Production Database..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it with your Supabase credentials."
    exit 1
fi

echo "📊 Running database migrations..."

# Execute the Bengali production data script
psql "${SUPABASE_DB_URL}" -f database/16_bengali_production_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Production data populated successfully!"
    echo ""
    echo "🎉 PawMatch is ready for production!"
    echo ""
    echo "📱 Bengali pets added:"
    echo "   - রাজা (Raja) - Local Dog"
    echo "   - মোতি (Moti) - Persian Cat"
    echo "   - ভোলা (Bhola) - Golden Retriever"
    echo "   - ছোটি (Choti) - Pomeranian"
    echo "   - কালো (Kalo) - Local Cat"
    echo "   - লাকি (Lucky) - Beagle"
    echo "   - প্রিন্সেস (Princess) - Persian Cat"
    echo "   - রানী (Rani) - German Shepherd"
    echo "   - টিগার (Tiger) - Tabby Cat"
    echo "   - বাদশা (Badsha) - Rottweiler"
    echo "   - পেউ (Peu) - Persian Mix"
    echo ""
    echo "🏪 Pet services added for major cities"
    echo "👥 Sample users created"
    echo "📚 Bengali learning articles added"
    echo ""
    echo "🚀 Now you can:"
    echo "   1. Build APK: npm run build:android"
    echo "   2. Test locally: npx expo start"
    echo "   3. Deploy admin panel: cd pawmatch-admin && npm run build"
else
    echo "❌ Failed to populate production data"
    echo "Please check your database connection and try again"
    exit 1
fi
