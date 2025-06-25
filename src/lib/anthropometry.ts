import type { SkinFoldRecord, SkinFoldSite } from "@/types/skinFold";

/**
 * Calcula la suma total de pliegues cutáneos
 */
export function sumOfSkinfolds(record: SkinFoldRecord): number {
  const values = Object.values(record.values).filter(
    (value): value is number => typeof value === "number" && value > 0
  );

  return Math.round(values.reduce((sum, value) => sum + value, 0) * 10) / 10;
}

/**
 * Calcula la suma de pliegues específicos (protocolo estándar)
 */
export function sumOfStandardSkinfolds(record: SkinFoldRecord): {
  sum4: number; // triceps + subscapular + suprailiac + abdominal
  sum6: number; // sum4 + thigh + calf
  sum7: number; // sum6 + chest (solo hombres)
} {
  const getValue = (site: SkinFoldSite): number => record.values[site] || 0;

  const sum4 =
    getValue("triceps") +
    getValue("subscapular") +
    getValue("suprailiac") +
    getValue("abdominal");

  const sum6 = sum4 + getValue("thigh") + getValue("calf");

  const sum7 = sum6 + getValue("chest");

  return {
    sum4: Math.round(sum4 * 10) / 10,
    sum6: Math.round(sum6 * 10) / 10,
    sum7: Math.round(sum7 * 10) / 10,
  };
}

/**
 * Estima el porcentaje de grasa corporal usando la fórmula Durnin-Womersley
 */
export function estimateBodyFatDurninWomersley(
  record: SkinFoldRecord,
  age: number,
  gender: "male" | "female"
): number | null {
  const { sum4 } = sumOfStandardSkinfolds(record);

  if (sum4 === 0) {
    return null; // No hay suficientes mediciones
  }

  // Calcular densidad corporal
  let density: number;

  if (gender === "male") {
    if (age < 30) {
      density = 1.161 - 0.0632 * Math.log10(sum4);
    } else if (age < 50) {
      density = 1.1422 - 0.0544 * Math.log10(sum4);
    } else {
      density = 1.162 - 0.07 * Math.log10(sum4);
    }
  } else {
    if (age < 30) {
      density = 1.1549 - 0.0678 * Math.log10(sum4);
    } else if (age < 50) {
      density = 1.1423 - 0.0632 * Math.log10(sum4);
    } else {
      density = 1.1333 - 0.0612 * Math.log10(sum4);
    }
  }

  // Convertir densidad a porcentaje de grasa (fórmula de Siri)
  const bodyFatPercentage = (4.95 / density - 4.5) * 100;

  return Math.round(bodyFatPercentage * 10) / 10;
}

/**
 * Estima el porcentaje de grasa corporal usando la fórmula Jackson-Pollock
 */
export function estimateBodyFatJacksonPollock(
  record: SkinFoldRecord,
  age: number,
  gender: "male" | "female"
): number | null {
  if (gender === "male") {
    // Fórmula de 3 sitios para hombres (chest, abdominal, thigh)
    const chest = record.values.chest || 0;
    const abdominal = record.values.abdominal || 0;
    const thigh = record.values.thigh || 0;

    if (chest === 0 || abdominal === 0 || thigh === 0) {
      return null; // Faltan mediciones requeridas
    }

    const sum3 = chest + abdominal + thigh;
    const density =
      1.10938 - 0.0008267 * sum3 + 0.0000016 * (sum3 * sum3) - 0.0002574 * age;
    const bodyFat = (4.95 / density - 4.5) * 100;

    return Math.round(bodyFat * 10) / 10;
  } else {
    // Fórmula de 3 sitios para mujeres (triceps, suprailiac, thigh)
    const triceps = record.values.triceps || 0;
    const suprailiac = record.values.suprailiac || 0;
    const thigh = record.values.thigh || 0;

    if (triceps === 0 || suprailiac === 0 || thigh === 0) {
      return null; // Faltan mediciones requeridas
    }

    const sum3 = triceps + suprailiac + thigh;
    const density =
      1.0994921 -
      0.0009929 * sum3 +
      0.0000023 * (sum3 * sum3) -
      0.0001392 * age;
    const bodyFat = (4.95 / density - 4.5) * 100;

    return Math.round(bodyFat * 10) / 10;
  }
}

/**
 * Obtiene recomendaciones basadas en los valores de pliegues cutáneos
 */
export function getSkinFoldRecommendations(
  record: SkinFoldRecord,
  age: number,
  gender: "male" | "female"
): string[] {
  const recommendations: string[] = [];
  const totalSum = sumOfSkinfolds(record);
  const bodyFat = estimateBodyFatJacksonPollock(record, age, gender);

  // Recomendaciones basadas en la suma total
  if (totalSum > 0) {
    if (gender === "male") {
      if (totalSum < 60) {
        recommendations.push(
          "Nivel de grasa corporal bajo - considera ganar masa muscular"
        );
      } else if (totalSum > 120) {
        recommendations.push(
          "Nivel de grasa corporal alto - enfócate en déficit calórico"
        );
      } else {
        recommendations.push(
          "Nivel de grasa corporal moderado - mantén rutina actual"
        );
      }
    } else {
      if (totalSum < 80) {
        recommendations.push(
          "Nivel de grasa corporal bajo - asegúrate de mantener salud hormonal"
        );
      } else if (totalSum > 150) {
        recommendations.push(
          "Nivel de grasa corporal alto - considera plan de reducción gradual"
        );
      } else {
        recommendations.push(
          "Nivel de grasa corporal saludable - mantén hábitos actuales"
        );
      }
    }
  }

  // Recomendaciones basadas en porcentaje de grasa estimado
  if (bodyFat !== null) {
    if (gender === "male") {
      if (bodyFat < 8) {
        recommendations.push("Grasa corporal muy baja - riesgo para la salud");
      } else if (bodyFat > 25) {
        recommendations.push("Considera aumentar actividad cardiovascular");
      }
    } else {
      if (bodyFat < 16) {
        recommendations.push(
          "Grasa corporal baja - monitorea ciclos hormonales"
        );
      } else if (bodyFat > 32) {
        recommendations.push("Considera plan estructurado de pérdida de peso");
      }
    }
  }

  // Recomendaciones específicas por sitios
  const triceps = record.values.triceps;
  const abdominal = record.values.abdominal;

  if (triceps && triceps > 20) {
    recommendations.push(
      "Pliegue tríceps elevado - incluye ejercicios para brazos"
    );
  }

  if (abdominal && abdominal > 25) {
    recommendations.push(
      "Pliegue abdominal elevado - enfócate en ejercicios de core"
    );
  }

  return recommendations.length > 0
    ? recommendations
    : ["Continúa con mediciones regulares para seguimiento de progreso"];
}

/**
 * Compara dos registros de pliegues cutáneos y devuelve las diferencias
 */
export function compareSkinFoldRecords(
  current: SkinFoldRecord,
  previous: SkinFoldRecord
): {
  totalChange: number;
  siteChanges: Partial<Record<SkinFoldSite, number>>;
  bodyFatChange?: number;
} {
  const currentSum = sumOfSkinfolds(current);
  const previousSum = sumOfSkinfolds(previous);
  const totalChange = Math.round((currentSum - previousSum) * 10) / 10;

  const siteChanges: Partial<Record<SkinFoldSite, number>> = {};

  // Calcular cambios por sitio
  const allSites: SkinFoldSite[] = [
    "triceps",
    "subscapular",
    "suprailiac",
    "abdominal",
    "thigh",
    "chest",
    "midaxillary",
    "biceps",
    "calf",
  ];

  for (const site of allSites) {
    const currentValue = current.values[site];
    const previousValue = previous.values[site];

    if (currentValue !== undefined && previousValue !== undefined) {
      const change = Math.round((currentValue - previousValue) * 10) / 10;
      if (change !== 0) {
        siteChanges[site] = change;
      }
    }
  }

  return {
    totalChange,
    siteChanges,
  };
}

/**
 * Valida si un registro de pliegues cutáneos es válido
 */
export function validateSkinFoldRecord(record: Partial<SkinFoldRecord>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar que tenga al menos un valor
  const values = Object.values(record.values || {}).filter(
    (value): value is number => typeof value === "number" && value > 0
  );

  if (values.length === 0) {
    errors.push("Debe incluir al menos una medición de pliegue cutáneo");
  }

  // Verificar rangos válidos
  for (const [site, value] of Object.entries(record.values || {})) {
    if (typeof value === "number") {
      if (value <= 0) {
        errors.push(`El valor para ${site} debe ser mayor a 0`);
      } else if (value > 50) {
        errors.push(`El valor para ${site} parece muy alto (>50mm)`);
      }
    }
  }

  // Verificar fecha
  if (record.date && !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
    errors.push("Formato de fecha inválido (debe ser YYYY-MM-DD)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
