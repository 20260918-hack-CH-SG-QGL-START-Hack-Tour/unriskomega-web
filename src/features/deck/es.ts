import type { Slide } from "./content";
export const es: Slide[] = [
  {
    kind: "hero",
    label: "UNRISKOMEGA · INTELIGENCIA PARA ASESORES",
    title: "Contexto de cartera.\nListo para la llamada.",
    body: "Un asistente de resúmenes basado en evidencia para la próxima conversación con el cliente.",
    points: ["START Hack Tour · St. Gallen", "19 de septiembre de 2026"],
    footnote:
      "Demostración de hackathon basada en el reto UnRiskOmega suministrado.",
    accent: true,
  },
  {
    kind: "problem",
    label: "01 / LA LLAMADA",
    title: "Llega la pregunta.\nEl contexto está disperso.",
    body: "El reto: una historia concisa del cliente que el asesor pueda leer en unos 60 segundos.",
    points: [
      "Cartera y posiciones",
      "Noticias de mercado",
      "Visión del CIO del banco",
    ],
    footnote:
      "Reto UnRiskOmega, pp. 8–12. El tiempo de lectura es un objetivo, no un SLA de generación medido.",
  },
  {
    kind: "briefing",
    label: "02 / EL RESUMEN",
    title: "Una respuesta meditada.\nEn un solo lugar.",
    body: "Selecciona el cliente. Revisa la cartera. Prepara la conversación con la evidencia a mano.",
    points: ["Evolución", "Salud de la cartera", "Perspectiva y conversación"],
    footnote:
      "Instantánea histórica. Los cambios del valor liquidativo no son rentabilidad verificada; las propuestas requieren revisión.",
  },
  {
    kind: "conversation",
    label: "03 / EL SEGUIMIENTO",
    title: "Haz una pregunta.\nMira la explicación.",
    body: "La misma conversación responde con gráficos, tablas, métricas, diagramas, evidencia o escenarios explícitos.",
    points: [
      "Texto y voz iniciada por el usuario",
      "Respuestas visuales con fuentes",
      "Imágenes generadas en la conversación",
    ],
    footnote:
      "Captura real del producto. Las respuestas se revisan antes de mostrarse; la revisión no garantiza exactitud financiera.",
    accent: true,
  },
  {
    kind: "evidence",
    label: "04 / LA EVIDENCIA",
    title: "La fuente acompaña\na la historia.",
    body: "Los cálculos de cartera establecen los hechos. El modelo los explica y otra revisión comprueba el borrador.",
    points: [
      "Se conserva el ámbito del cliente",
      "Los datos ausentes siguen visibles",
      "Las acciones son borradores para conversar",
    ],
    footnote:
      "No se suministran noticias actuales ni una visión aprobada del banco. Su ausencia se indica explícitamente.",
  },
  {
    kind: "custody",
    label: "05 / LA CARTERA EXTERNA",
    title: "Un extracto externo.\nUna conversación de cartera.",
    body: "El flujo adicional incorpora un PDF de custodia a una cartera virtual revisada, junto al contexto nativo.",
    points: [
      "Conservar páginas y fechas de valoración",
      "Conciliar identificadores e importes",
      "Confirmar antes de utilizar la cartera",
    ],
    footnote:
      "La importación requiere revisión. Las posiciones sin resolver deben permanecer visibles; no se envían órdenes.",
  },
  {
    kind: "architecture",
    label: "06 / EL SISTEMA",
    title: "Un recorrido controlado\ndel dato a la respuesta.",
    body: "Un flujo acotado de agentes conecta el espacio de trabajo con la evidencia y una revisión del modelo mediante una única pasarela.",
    points: [
      "Espacio Next.js",
      "Backend y datos en Rust",
      "Orquestación OpenClaw",
      "Núcleo Rust · modelo y revisión",
    ],
    footnote:
      "Cinco servicios en Azure. Las credenciales permanecen en el núcleo; los resultados del proceso no son memoria persistente.",
  },
  {
    kind: "business",
    label: "07 / HIPÓTESIS DE NEGOCIO",
    title: "Para los asesores.\nContratado por instituciones.",
    body: "Empezar con un flujo de preparación dentro de un banco o plataforma de asesoramiento.",
    points: [
      "Gestores de relaciones y asesores de inversión",
      "Bancos y plataformas de cartera",
      "Suscripción de plataforma y asesores activos",
      "Medir tiempo de preparación y exactitud",
    ],
    footnote:
      "Hipótesis comercial. Demanda, precio y disposición a pagar requieren un piloto; no se afirma tamaño de mercado ni tracción.",
  },
  {
    kind: "roadmap",
    label: "08 / ENTREGA Y VALIDACIÓN",
    title: "Un producto funcional.\nUn próximo paso medible.",
    body: "JO desarrolló la demostración con los datos suministrados, acceso multilingüe y razonamiento inspeccionable.",
    points: [
      "Resumen, seguimiento visual y voz",
      "Grafo de fuentes e inspección del runtime",
      "Evaluar otro cliente con asesores",
      "Medir comprensión, exactitud y tiempo",
    ],
    footnote:
      "La demostración no acredita preparación para producción, aprobación de integración bancaria ni respaldo de clientes.",
  },
  {
    kind: "closing",
    label: "09 / LA DEMO",
    title: "Trae un cliente de prueba.\nPreparemos la llamada.",
    body: "Un socio. Un flujo aprobado. Un piloto con responsables de revisión y resultados medibles.",
    points: [
      "Abrir el espacio del asesor",
      "Inspeccionar la evidencia de una respuesta",
    ],
    footnote: "START Hack Tour St. Gallen · Reto UnRiskOmega · JO",
    accent: true,
  },
];
