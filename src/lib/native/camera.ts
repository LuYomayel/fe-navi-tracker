/**
 * Captura de fotos con fallback web.
 *
 * En nativo usa @capacitor/camera (camara/galeria del sistema). En web devuelve
 * null para que el caller use su <input type="file"> de siempre.
 *
 * Siempre resuelve a un data URL `data:image/jpeg;base64,...`, identico a lo que
 * produce FileReader.readAsDataURL — asi el resto del flujo (OpenAI Vision) no
 * cambia.
 */
import { isNative } from "./platform";

export type PhotoSource = "camera" | "photos" | "prompt";

export async function pickPhoto(
  source: PhotoSource = "prompt",
): Promise<string | null> {
  if (!isNative()) return null;

  const { Camera, CameraResultType, CameraSource } = await import(
    "@capacitor/camera"
  );

  const sourceMap = {
    camera: CameraSource.Camera,
    photos: CameraSource.Photos,
    prompt: CameraSource.Prompt,
  } as const;

  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: sourceMap[source],
    promptLabelHeader: "Foto",
    promptLabelPhoto: "Galería",
    promptLabelPicture: "Cámara",
    correctOrientation: true,
  });

  return photo.dataUrl ?? null;
}

/** Pide permisos de camara/fotos por adelantado (opcional). */
export async function ensureCameraPermissions(): Promise<boolean> {
  if (!isNative()) return true;
  try {
    const { Camera } = await import("@capacitor/camera");
    const status = await Camera.checkPermissions();
    if (status.camera === "granted" && status.photos === "granted") return true;
    const req = await Camera.requestPermissions({
      permissions: ["camera", "photos"],
    });
    return req.camera === "granted" || req.photos === "granted";
  } catch {
    return false;
  }
}
