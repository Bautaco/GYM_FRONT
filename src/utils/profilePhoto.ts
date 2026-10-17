// Reduce la foto antes de enviarla: el perfil conserva una miniatura, no el original.
export async function prepareProfilePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Elegí una imagen JPG, PNG o WebP.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La foto debe pesar menos de 10 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 512 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la foto en este navegador.');
    context.fillStyle = '#eed8c0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.65, 0.45, 0.25]) {
      const photo = canvas.toDataURL('image/jpeg', quality);
      // Deja espacio al resto del formulario dentro del límite de la API.
      if (photo.length <= 60000) return photo;
    }
    throw new Error('La imagen tiene demasiado detalle. Probá con una foto recortada.');
  } catch (error) {
    if (error instanceof Error && error.name !== 'EncodingError') throw error;
    throw new Error('No se pudo leer la imagen. Probá con otra foto.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
