const MAX_EDGE = 720
const JPEG_QUALITY = 0.82
const MAX_DATA_URL_CHARS = 900_000

/**
 * Resize and compress an image file to a JPEG data URL for Firestore storage.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, w, h)

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error('Image is still too large after compression. Try a smaller photo.')
  }
  return dataUrl
}
