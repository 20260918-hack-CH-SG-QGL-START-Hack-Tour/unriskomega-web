import type { RuntimeCopy } from "./types";
export const es: RuntimeCopy = {
  agents: {
    manager:
      "Selecciona un flujo acotado de asesoramiento o explicación visual para la instantánea de evidencia actual.",
    "evidence-curator":
      "Asigna identificadores y ubicaciones JSON a la evidencia de la ejecución; nunca obtiene instrucciones externas.",
    "portfolio-analyst":
      "Explica la asignación, las alertas de idoneidad comunicadas, el riesgo de la instantánea y la rentabilidad no disponible en el idioma solicitado.",
    "visual-explainer":
      "Selecciona tarjetas, tablas y gráficos vinculados a evidencia o diagramas claramente conceptuales para la conversación.",
    verifier:
      "Una solicitud de modelo independiente comprueba el borrador frente a la misma evidencia tras validar componentes y citas de forma determinista.",
    "outcome-owner":
      "Registra resúmenes acotados y el estado de verificación sin conservar la evidencia del cliente ni el texto de la conversación.",
    "image-designer":
      "Utiliza el proveedor configurado para crear una ilustración solicitada explícitamente sin enviar evidencia de la cartera.",
  },
  skills: {
    "portfolio-health": [
      "Prioriza alertas de idoneidad y calidad de datos; conserva su gravedad y nunca certifica la idoneidad.",
      "Instantánea de la cartera seleccionada, alertas comunicadas, riesgo y fechas de referencia",
      "Puntos de conversación vinculados a fuentes para revisión del asesor",
    ],
    "allocation-check": [
      "Compara los pesos y objetivos suministrados sin mezclar unidades, taxonomías ni monedas.",
      "Filas de asignación con peso, objetivo, mínimo, máximo y desviación",
      "Tabla o gráfico de asignación vinculado a evidencia",
    ],
    "performance-honesty": [
      "Distingue los cambios de la serie de valor liquidativo suministrada de los rendimientos de inversión y la atribución no disponible.",
      "Historial suministrado, fechas de referencia y carencias de datos",
      "Observaciones etiquetadas con precisión o estados explícitos de no disponibilidad",
    ],
    "evidence-grounding": [
      "Mantiene las afirmaciones dentro del ámbito de evidencia seleccionado, con fuentes identificables y límites visibles.",
      "Registros de evidencia de la ejecución y una respuesta propuesta",
      "Identificadores validados, comprobaciones deterministas y revisión independiente del modelo",
    ],
    "visual-explanation": [
      "Elige componentes semánticos acotados para explicar los datos suministrados sin código ejecutable.",
      "Pregunta y evidencia de la ejecución",
      "Métrica, tabla, gráfico, evidencia, diagrama conceptual o proyección expresamente hipotética",
    ],
    "image-generation": [
      "Genera dentro de la conversación una imagen conceptual solicitada por el usuario mediante el proveedor configurado.",
      "Petición visual explícita e idioma; sin evidencia de cartera",
      "Imagen PNG marcada como ilustrativa",
    ],
  },
  steps: {
    manager:
      "Seleccionar el especialista de asesoramiento o visualización según la pregunta, sin herramientas externas.",
    "evidence-curator":
      "Crear identificadores de evidencia para esta ejecución a partir de la instantánea enviada por el servidor.",
    "portfolio-analyst":
      "Generar una respuesta ajustada al esquema; el especialista visual sustituye este rol ante peticiones visuales explícitas.",
    verifier:
      "Comprobar estructura, pertenencia de fuentes y componentes numéricos; después revisar el borrador de manera independiente mediante otra solicitud al modelo.",
    "outcome-owner":
      "Devolver el estado aceptado o requiere revisión y conservar únicamente un resumen anónimo acotado de la ejecución.",
  },
};
