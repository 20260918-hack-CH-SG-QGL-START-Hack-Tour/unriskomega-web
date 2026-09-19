import type { Slide } from "./content";
export const es: Slide[] = [
  {
    label: "01 / UNRISKOMEGA",
    title: "Contexto de cartera.\nListo para conversar.",
    body: "Un asistente que convierte instantáneas de cartera en resúmenes concisos y trazables.",
    points: ["START Hack Tour St. Gallen", "19 de septiembre de 2026"],
    footnote:
      "Demostración del hackathon con los datos proporcionados en el reto.",
    accent: true,
  },
  {
    label: "02 / EL PROBLEMA",
    title: "El cliente llama.\nEl contexto está disperso.",
    body: "El asesor necesita conectar posiciones, límites de asignación y contexto antes de explicar claramente la cartera.",
    points: [
      "Conciliar los detalles financieros requiere tiempo.",
      "Un resumen fluido puede ocultar la falta de fuentes.",
    ],
    footnote: "Planteamiento: reto UnRiskOmega proporcionado, páginas 8–10.",
  },
  {
    label: "03 / LA SOLUCIÓN",
    title: "Una cartera.\nUn resumen preparado.",
    body: "Selecciona una cartera y revisa su evolución, salud y perspectivas con la instantánea fuente a la vista.",
    points: [
      "Inspecciona la asignación y los hallazgos registrados.",
      "Explora preguntas por texto o voz.",
    ],
    footnote:
      "La demo depende de los servicios conectados y la disponibilidad de modelos.",
  },
  {
    label: "04 / LA DIFERENCIA",
    title: "Las fuentes siempre\nestán a mano.",
    body: "Los cálculos deterministas establecen los hechos. La IA ayuda a explicarlos dentro del contexto del cliente seleccionado.",
    points: [
      "El historial no disponible sigue siendo no disponible.",
      "El asesor revisa cada propuesta de discusión.",
    ],
    footnote:
      "Sin operaciones autónomas, certificación de idoneidad ni rendimientos prometidos.",
  },
  {
    label: "05 / CLIENTES",
    title: "Diseñado para\nel trabajo del asesor.",
    body: "Los primeros usuarios propuestos son gestores de relaciones y asesores que trabajan con plataformas de cartera.",
    points: [
      "Hipótesis de comprador: bancos y plataformas de asesoramiento.",
      "Primera validación: un flujo de preparación con un grupo pequeño.",
    ],
    footnote:
      "La demanda, el tamaño del mercado y la disposición a pagar no están validados.",
  },
  {
    label: "06 / MODELO DE NEGOCIO",
    title: "Licencia de plataforma.\nValor en la preparación.",
    body: "Probar una suscripción para bancos o plataformas con un componente por asesor activo, tras un piloto acotado.",
    points: [
      "Medir tiempo de preparación y resúmenes aceptados.",
      "Incluir costes de modelos, datos, infraestructura y revisión.",
    ],
    footnote:
      "Hipótesis comercial. No se afirman precios, ingresos ni clientes contratados.",
  },
  {
    label: "07 / ARQUITECTURA",
    title: "Límites claros.\nUna pasarela de IA controlada.",
    body: "Next.js se conecta a servicios Rust mediante HTTP autenticado y WebSockets. Los servicios internos usan gRPC.",
    points: [
      "AI core guarda las claves. OpenClaw consume AI core.",
      "WebRTC lleva la voz iniciada por el usuario. Azure aloja los contenedores.",
    ],
    footnote: "El navegador y covenant no reciben la clave del proveedor.",
  },
  {
    label: "08 / POSICIONAMIENTO",
    title: "Una capa de resumen\nen el trabajo de cartera.",
    body: "La hipótesis conecta el análisis existente con una preparación legible e inspeccionable para el cliente.",
    points: [
      "Los sistemas de cartera siguen siendo la fuente de registro.",
      "Un chat genérico por sí solo no demuestra los datos de cartera.",
    ],
    footnote:
      "Hipótesis de posicionamiento, no una afirmación verificada de exclusividad.",
  },
  {
    label: "09 / ENTREGA Y EQUIPO",
    title: "Una demo funcional.\nDespués, un piloto enfocado.",
    body: "JO lidera esta implementación. El siguiente paso es evaluar con un socio autorizado y responsables de revisión.",
    points: [
      "Ahora: datos del reto, espacio multilingüe e integración.",
      "Después: clientes nuevos, comprensión del asesor y revisión de seguridad.",
    ],
    footnote:
      "No se afirman respaldo de socios, tracción comercial ni certificación de producción.",
  },
  {
    label: "10 / PROPUESTA",
    title: "Probemos una mejor\nconversación con el cliente.",
    body: "Un socio. Un flujo de preparación aprobado. Un piloto medido con criterios claros de revisión y salida.",
    points: [
      "Comparar tiempo de preparación y precisión factual.",
      "Ampliar solo tras uso repetido y evidencia de calidad.",
    ],
    footnote: "Abre el espacio para explorar la demostración del reto.",
    accent: true,
  },
];
