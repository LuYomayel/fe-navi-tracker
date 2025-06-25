export type SkinFoldSite =
  | "triceps"
  | "subscapular"
  | "suprailiac"
  | "abdominal"
  | "thigh"
  | "chest"
  | "midaxillary"
  | "biceps"
  | "calf";

export interface SkinFoldRecord {
  id: string; // uuid
  date: string; // yyyy-mm-dd
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  technician?: string; // name of nutritionist or "AI"
  notes?: string;
  // Thickness in mm; undefined if not measured
  values: Partial<Record<SkinFoldSite, number>>;
  aiConfidence?: number; // 0-1 when extracted by AI
}

// Nombres en español para la UI
export const SkinFoldSiteNames: Record<SkinFoldSite, string> = {
  triceps: "Tríceps",
  subscapular: "Subescapular",
  suprailiac: "Supraespinal",
  abdominal: "Abdominal",
  thigh: "Muslo",
  chest: "Pectoral",
  midaxillary: "Axilar medio",
  biceps: "Bíceps",
  calf: "Pantorrilla",
};

// Descripción anatómica para tooltips
export const SkinFoldDescriptions: Record<SkinFoldSite, string> = {
  triceps:
    "Pliegue vertical en la cara posterior del brazo, punto medio entre acromion y olécranon",
  subscapular: "Pliegue oblicuo bajo el ángulo inferior de la escápula",
  suprailiac: "Pliegue oblicuo sobre la cresta ilíaca, línea axilar anterior",
  abdominal: "Pliegue vertical lateral al ombligo, 2cm hacia la derecha",
  thigh:
    "Pliegue vertical en la cara anterior del muslo, punto medio inguinal-rotuliano",
  chest: "Pliegue diagonal entre axila y pezón (solo hombres)",
  midaxillary:
    "Pliegue vertical en línea axilar media, nivel del apéndice xifoides",
  biceps:
    "Pliegue vertical en la cara anterior del brazo, mismo nivel que tríceps",
  calf: "Pliegue vertical en la cara medial de la pantorrilla, máxima circunferencia",
};

// Orden recomendado para medición ISAK
export const SkinFoldMeasurementOrder: SkinFoldSite[] = [
  "triceps",
  "subscapular",
  "biceps",
  "suprailiac",
  "abdominal",
  "thigh",
  "chest",
  "midaxillary",
  "calf",
];
