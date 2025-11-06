# Custom Images Feature

## Overview
This feature allows event organizers to upload additional custom images for their events, such as:
- Clothing size charts (Ukuran Kaos)
- Venue maps
- Event schedules
- Parking information
- Any other visual information

## How to Use

### For Event Organizers

1. **Creating a New Event:**
   - Navigate to "Dashboard" → "Create Event"
   - Fill in the basic event information in the "Basic Information" tab
   - Click on the "Custom Images" tab
   - Click "Add Image" button
   - Upload your image (max 5MB, PNG/JPG/WEBP)
   - Add a title (e.g., "Ukuran Kaos" or "T-Shirt Sizes")
   - Optionally add a description
   - You can add multiple images
   - Click "Create Event" when done

2. **Editing an Existing Event:**
   - Navigate to "Dashboard" → Select your event → "Edit"
   - Go to the "Custom Images" tab
   - Add, edit, or remove custom images as needed
   - Click "Update Event" to save changes

### Features

- **Drag and Drop Upload:** Simply drag and drop images to upload
- **Image Preview:** See uploaded images immediately
- **Title & Description:** Add context for each image
- **Multiple Images:** Upload as many custom images as needed
- **Easy Management:** Remove or replace images anytime

## Technical Implementation

### Current Implementation (MVP)
The current implementation stores custom images data in `localStorage` for demonstration purposes:
- Key: `event_custom_images_{event_id}`
- Value: JSON array of image objects

**Structure:**
```json
[
  {
    "title": "Ukuran Kaos",
    "description": "Panduan ukuran kaos untuk peserta",
    "url": "https://your-r2-bucket.com/path/to/image.jpg"
  }
]
```

### Production Implementation Recommendations

For a production environment, you should store custom images in the database. Here are the recommended approaches:

#### Option 1: Create a New Table (Recommended)

Create a new `event_images` table:

```sql
CREATE TABLE event_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_images_event_id ON event_images(event_id);
```

Then update the TypeScript types in `lib/database.types.ts`:

```typescript
event_images: {
    Row: {
        id: string
        event_id: string
        title: string
        description: string | null
        image_url: string
        order_index: number
        created_at: string
        updated_at: string
    }
    Insert: {
        id?: string
        event_id: string
        title: string
        description?: string | null
        image_url: string
        order_index?: number
        created_at?: string
        updated_at?: string
    }
    Update: {
        id?: string
        event_id?: string
        title?: string
        description?: string | null
        image_url?: string
        order_index?: number
        created_at?: string
        updated_at?: string
    }
}
```

#### Option 2: Add JSONB Column to Events Table

Add a JSONB column to the existing `events` table:

```sql
ALTER TABLE events ADD COLUMN custom_images JSONB DEFAULT '[]';
```

Update the events type in `lib/database.types.ts`:

```typescript
events: {
    Row: {
        // ... existing fields
        custom_images: Json | null
    }
    Insert: {
        // ... existing fields
        custom_images?: Json | null
    }
    Update: {
        // ... existing fields
        custom_images?: Json | null
    }
}
```

### Migration Guide

To migrate from localStorage to database:

1. **Create the database table/column** (see options above)

2. **Update the Create Page** (`app/dashboard/events/create/page.tsx`):

Replace the localStorage code with:

```typescript
// For Option 1 (separate table):
if (customImages.length > 0) {
    const imagesToInsert = customImages.map((img, index) => ({
        event_id: event.id,
        title: img.title,
        description: img.description,
        image_url: img.url,
        order_index: index,
    }));

    const { error: imagesError } = await supabase
        .from('event_images')
        .insert(imagesToInsert);

    if (imagesError) throw imagesError;
}

// For Option 2 (JSONB column):
// Just include custom_images in the event insert:
const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
        ...formData,
        custom_images: customImages.map(img => ({
            title: img.title,
            description: img.description,
            url: img.url
        })),
        // ... other fields
    })
```

3. **Update the Edit Page** (`app/dashboard/events/[id]/edit/page.tsx`):

```typescript
// Load custom images
const { data: imagesData } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });

setCustomImages(imagesData || []);

// Save custom images (in handleSubmit)
// Delete existing images
await supabase
    .from('event_images')
    .delete()
    .eq('event_id', eventId);

// Insert new images
if (customImages.length > 0) {
    const imagesToInsert = customImages.map((img, index) => ({
        event_id: eventId,
        title: img.title,
        description: img.description,
        image_url: img.url,
        order_index: index,
    }));

    await supabase
        .from('event_images')
        .insert(imagesToInsert);
}
```

4. **Display Custom Images on Event Detail Page** (`app/events/[id]/page.tsx`):

Add loading logic:

```typescript
const { data: customImages } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });
```

Add display section:

```tsx
{customImages && customImages.length > 0 && (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customImages.map((image, index) => (
                <div key={index} className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {image.title}
                    </h3>
                    {image.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {image.description}
                        </p>
                    )}
                    <Image
                        src={image.image_url}
                        alt={image.title}
                        width={600}
                        height={400}
                        className="w-full rounded-lg object-cover"
                    />
                </div>
            ))}
        </div>
    </div>
)}
```

## Components

### CustomImagesUpload Component
Located at: `components/CustomImagesUpload.tsx`

**Props:**
- `images`: Array of custom image objects
- `onChange`: Callback function when images change

**Features:**
- File upload with validation (max 5MB)
- Image preview
- Title and description fields
- Add/Remove functionality
- Loading states
- Dark mode support

## Storage

Images are uploaded to **Cloudflare R2** via the `/api/upload` endpoint, which handles:
- File validation
- Authentication check
- Upload to R2
- URL generation

## Future Enhancements

1. **Drag to Reorder:** Allow organizers to reorder images by dragging
2. **Image Cropping:** Built-in image cropping/editing
3. **Templates:** Pre-made templates for common use cases (size charts, etc.)
4. **Gallery View:** Show all images in a lightbox/gallery on event detail page
5. **Image Optimization:** Automatic image compression and optimization
6. **Multiple Sizes:** Generate different image sizes for responsive display

## Troubleshooting

### Images not showing after refresh
This is expected in the current localStorage implementation. Migrate to database storage for persistent data.

### Upload fails
- Check file size (must be < 5MB)
- Verify Cloudflare R2 credentials in environment variables
- Check network connection

### Images not saving
- Ensure you click "Create Event" or "Update Event" after adding images
- Check browser console for errors
- Verify localStorage is enabled in browser settings (for current implementation)

## Support

For questions or issues, please contact the development team or open an issue in the repository.
