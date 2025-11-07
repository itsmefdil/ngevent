-- Create storage bucket for events if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access for Event Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies for events bucket
-- 1. Allow public read access (GET)
CREATE POLICY "Public can view event files"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- 2. Allow authenticated users to upload files (INSERT)
CREATE POLICY "Authenticated users can upload event files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events'
);

-- 3. Allow users to update their own files (UPDATE)
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'events' 
  AND (SELECT auth.uid()) = owner
)
WITH CHECK (
  bucket_id = 'events'
  AND (SELECT auth.uid()) = owner
);

-- 4. Allow users to delete their own files (DELETE)
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'events'
  AND (SELECT auth.uid()) = owner
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id 
ON storage.objects(bucket_id);

CREATE INDEX IF NOT EXISTS idx_storage_objects_owner 
ON storage.objects(owner);

-- Comments
COMMENT ON POLICY "Public can view event files" ON storage.objects IS 
'Allow anyone to view files in events bucket (for public event images)';

COMMENT ON POLICY "Authenticated users can upload event files" ON storage.objects IS 
'Allow authenticated users to upload files to events bucket';

COMMENT ON POLICY "Users can update their own files" ON storage.objects IS 
'Allow users to update only files they uploaded';

COMMENT ON POLICY "Users can delete their own files" ON storage.objects IS 
'Allow users to delete only files they uploaded';
