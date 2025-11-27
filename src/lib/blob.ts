import { put, del } from '@vercel/blob'

export async function uploadImage(file: File, folder: string = 'products') {
  try {
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    })

    return { url: blob.url, success: true }
  } catch (error) {
    console.error('Upload error:', error)
    return { url: null, success: false, error }
  }
}

export async function deleteImage(url: string) {
  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error }
  }
}

export async function uploadMultipleImages(
  files: File[],
  folder: string = 'products'
) {
  const uploads = await Promise.all(
    files.map((file) => uploadImage(file, folder))
  )

  const successful = uploads.filter((u) => u.success)
  const failed = uploads.filter((u) => !u.success)

  return {
    urls: successful.map((u) => u.url!),
    success: failed.length === 0,
    failedCount: failed.length,
  }
}
