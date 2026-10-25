/**
 * Уменьшает фото перед отправкой (длинная сторона ≤ maxSide, JPEG).
 * Фото с телефона весит 5–10 МБ; для распознавания текста хватает ~2400px.
 * Если браузер не умеет — возвращается исходный файл.
 */
export async function downscaleImage(
  file: File,
  maxSide = 2400,
  quality = 0.85,
): Promise<Blob> {
  try {
    // imageOrientation: «from-image» — учитывает поворот из EXIF
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );

    return blob ?? file;
  } catch {
    return file;
  }
}
