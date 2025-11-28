import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Storage bucket name for UGC videos
export const UGC_VIDEOS_BUCKET = 'ugc-videos'

// Create a new Supabase client for each request (server actions)
export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase env vars:', {
      url: supabaseUrl ? 'set' : 'missing',
      key: supabaseServiceKey ? 'set' : 'missing',
    })
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Initialize storage bucket (call once during setup)
export async function initializeStorage() {
  const client = getSupabaseClient()
  const { data: buckets } = await client.storage.listBuckets()

  const bucketExists = buckets?.some((b) => b.name === UGC_VIDEOS_BUCKET)

  if (!bucketExists) {
    await client.storage.createBucket(UGC_VIDEOS_BUCKET, {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['video/mp4', 'video/webm', 'image/png', 'image/jpeg'],
    })
  }
}

// Upload video to Supabase Storage
export async function uploadVideo(
  file: Buffer | Blob,
  fileName: string,
  contentType: string = 'video/mp4'
) {
  const client = getSupabaseClient()
  const filePath = `videos/${Date.now()}-${fileName}`

  const { error } = await client.storage.from(UGC_VIDEOS_BUCKET).upload(filePath, file, {
    contentType,
    upsert: false,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = client.storage.from(UGC_VIDEOS_BUCKET).getPublicUrl(filePath)

  return publicUrl
}

// Upload thumbnail
export async function uploadThumbnail(file: Buffer | Blob, fileName: string) {
  const client = getSupabaseClient()
  const filePath = `thumbnails/${Date.now()}-${fileName}`

  const { error } = await client.storage.from(UGC_VIDEOS_BUCKET).upload(filePath, file, {
    contentType: 'image/png',
    upsert: false,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = client.storage.from(UGC_VIDEOS_BUCKET).getPublicUrl(filePath)

  return publicUrl
}
