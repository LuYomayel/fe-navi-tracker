/**
 * Achica una imagen en el cliente (canvas) antes de subirla: el backend
 * guarda el archivo tal cual llega, asi que el resize pasa aca. JPEG 0.85
 * con lado mayor 1200px deja fotos de catalogo de ~150-300KB.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxSide = 1200,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
