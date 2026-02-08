#!/bin/bash

# Quick Migration Runner for Event ID Change
# This script helps you run the database migration safely

set -e

echo "================================================"
echo "🔄 Event ID Migration to varchar(6)"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL is not set${NC}"
    echo "Please set DATABASE_URL in .env file"
    exit 1
fi

echo -e "${BLUE}📊 Current Migration Status:${NC}"
cat drizzle/meta/_journal.json | grep -A 3 "entries" | tail -5
echo ""

echo -e "${YELLOW}⚠️  Warning: This is a BREAKING CHANGE${NC}"
echo "   - Event IDs will change from UUID to 6-character format"
echo "   - Existing UUID data cannot be converted automatically"
echo "   - Recommended for fresh databases only"
echo ""

read -p "$(echo -e ${YELLOW}Do you want to continue? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Migration cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔍 Checking for existing events...${NC}"

# Try to count events (will fail if table doesn't exist yet)
EVENT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM events;" 2>/dev/null || echo "0")
EVENT_COUNT=$(echo $EVENT_COUNT | tr -d ' ')

if [ "$EVENT_COUNT" -gt 0 ]; then
    echo -e "${RED}❌ Found $EVENT_COUNT events in database${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: You have existing data!${NC}"
    echo "   This migration will break existing event IDs"
    echo "   Options:"
    echo "   1. Backup and clear data first"
    echo "   2. Cancel and run on fresh database"
    echo ""
    read -p "$(echo -e ${RED}Are you SURE you want to continue? [y/N]:${NC} )" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Migration cancelled${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ No existing events found - safe to proceed${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Running migration...${NC}"
echo ""

# Run migration
bun run db:migrate

echo ""
echo -e "${GREEN}✅ Migration completed!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Test create event: POST /api/events"
echo "   2. Verify ID format is 6 characters"
echo "   3. Test frontend routes: /e/:id"
echo "   4. Update frontend if needed"
echo ""
echo -e "${BLUE}🔗 New URL Format:${NC}"
echo "   Old: /events/123e4567-e89b-12d3-a456-426614174000"
echo "   New: /e/3K7M2P"
echo ""
echo "================================================"
echo "🎉 Migration Complete!"
echo "================================================"
