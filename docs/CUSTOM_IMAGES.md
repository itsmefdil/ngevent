# Custom Event Images - Documentation

## Overview
Added functionality to upload custom images to events (e.g., size charts, venue maps, schedules).

## What's New

### Files Created/Modified:
1. ✅ `/components/CustomImagesUpload.tsx` - Reusable upload component
2. ✅ `/app/api/upload/route.ts` - Image upload API endpoint
3. ✅ `/app/dashboard/events/create/page.tsx` - Added custom images tab
4. ✅ `/app/dashboard/events/[id]/edit/page.tsx` - Added custom images tab
5. ✅ `/next.config.js` - Increased body size limit to 5MB

## Fixed Issues

### ❌ Error: Body exceeded 1 MB limit
**Problem**: Form submission failed because image data exceeded Next.js server action body limit.

**Solution**:
1. Modified `CustomImagesUpload` component to NOT store file objects in state
2. Images upload immediately via API route (not on form submit)
3. Only URLs are stored in state
4. Increased Next.js body size limit to 5MB in `next.config.js`

## How It Works

1. **User adds image**: Clicks "Add Image" button
2. **User uploads file**: File uploads immediately to Supabase Storage via `/api/upload`
3. **Store URL only**: Only the image URL is stored in component state
4. **Save metadata**: On form submit, only URLs and metadata are saved (lightweight)

## Current Storage (Temporary)

**⚠️ Using localStorage** (for quick implementation):
- Key: `event_custom_images_{eventId}`
- Value: JSON array of `[{title, description, url}]`

## Production Migration Required

### Quick Fix (Add to events table):
\`\`\`sql
ALTER TABLE events ADD COLUMN custom_images JSONB DEFAULT '[]'::jsonb;
\`\`\`

### Better Solution (New table):
\`\`\`sql
CREATE TABLE event_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

See migration guide in production deployment notes.

## Usage

### For Organizers:
1. Go to Create/Edit Event page
2. Click "Custom Images" tab
3. Click "Add Image"
4. Upload image (max 5MB)
5. Add title and description
6. Save event

### Display on Event Page:
Load from localStorage:
\`\`\`typescript
const storedImages = localStorage.getItem(\`event_custom_images_\${eventId}\`);
if (storedImages) {
    setCustomImages(JSON.parse(storedImages));
}
\`\`\`

Then render in your UI.

## Configuration

### Body Size Limit
In `next.config.js`:
\`\`\`javascript
experimental: {
    serverActions: {
        bodySizeLimit: '5mb', // Increased from default 1mb
    },
}
\`\`\`

### File Upload Limits
In `/app/api/upload/route.ts`:
- Max size: 5MB
- Allowed types: image/*
- Storage: Supabase Storage (events bucket)
- Path pattern: `custom-images/{userId}-{timestamp}.{ext}`

## Testing

Build successful ✅
\`\`\`bash
npm run build
\`\`\`

All routes compiled successfully with no errors.
