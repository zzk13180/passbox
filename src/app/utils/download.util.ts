export function downloadByData(
  data: BlobPart,
  filename: string,
  mime = 'application/octet-stream',
  bom?: BlobPart,
) {
  if (!window || !window.URL) {
    return
  }
  const blobData = bom ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime })
  const blobURL = URL.createObjectURL(blob)
  const tempLink = document.createElement('a')
  tempLink.style.display = 'none'
  tempLink.href = blobURL
  tempLink.download = filename
  document.body.appendChild(tempLink)
  tempLink.click()
  document.body.removeChild(tempLink)
  URL.revokeObjectURL(blobURL)
}
