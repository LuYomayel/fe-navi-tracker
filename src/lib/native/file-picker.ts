/**
 * Selector de PDFs (plan nutricionista, antropometria) con fallback web.
 * En nativo usa @capawesome/capacitor-file-picker; en web devuelve null para
 * que el caller use su <input type="file" accept="application/pdf">.
 *
 * Devuelve un data URL `data:application/pdf;base64,...`.
 */
import { isNative } from "./platform";

export async function pickPdf(): Promise<{
  dataUrl: string;
  name: string;
} | null> {
  if (!isNative()) return null;

  const { FilePicker } = await import("@capawesome/capacitor-file-picker");
  const result = await FilePicker.pickFiles({
    types: ["application/pdf"],
    readData: true,
  });

  const file = result.files?.[0];
  if (!file?.data) return null;

  const mime = file.mimeType || "application/pdf";
  return {
    dataUrl: `data:${mime};base64,${file.data}`,
    name: file.name || "documento.pdf",
  };
}
