import type { Locale } from "@/lib/i18n";

const en = {
  title: "Market sources",
  news: "Public business news",
  house: "Public bank outlook",
  available: "Available",
  unavailable: "Unavailable",
  disabled: "Disabled",
  retrieved: "Retrieved",
  published: "Published",
  sourceDate: "Publisher’s data date",
  read: "Read source",
  more: "View source details",
  retry: "Retry sources",
  loading: "Loading market sources…",
  error: "Market sources could not be loaded.",
  missing:
    "This source is currently unavailable. No current source claims are inferred.",
  newsScope:
    "General business headlines; relevance to individual holdings requires review.",
  houseScope:
    "A public external bank perspective, not your bank’s internal CIO policy or a client mandate.",
  dateCaveat:
    "The publisher’s data date and retrieval date differ. A fresh retrieval does not make an older outlook current.",
  sourceLanguage: "Source excerpts remain in their original language.",
  dateUnknown: "Source date unavailable",
};
export const marketMessages: Record<Locale, typeof en> = {
  en,
  es: {
    title: "Fuentes de mercado",
    news: "Noticias públicas de economía",
    house: "Perspectiva bancaria pública",
    available: "Disponible",
    unavailable: "No disponible",
    disabled: "Desactivada",
    retrieved: "Consultada",
    published: "Publicada",
    sourceDate: "Fecha de los datos del editor",
    read: "Leer fuente",
    more: "Ver detalles de las fuentes",
    retry: "Reintentar fuentes",
    loading: "Cargando fuentes de mercado…",
    error: "No se pudieron cargar las fuentes de mercado.",
    missing:
      "Esta fuente no está disponible. No se infieren afirmaciones actuales.",
    newsScope:
      "Titulares generales; la relevancia para cada posición requiere revisión.",
    houseScope:
      "Una perspectiva pública de un banco externo, no la política interna de inversión de tu banco ni un mandato del cliente.",
    dateCaveat:
      "La fecha de los datos y la consulta son distintas. Una consulta reciente no actualiza una perspectiva antigua.",
    sourceLanguage: "Los extractos se mantienen en su idioma original.",
    dateUnknown: "Fecha de fuente no disponible",
  },
  de: {
    title: "Marktquellen",
    news: "Öffentliche Wirtschaftsnachrichten",
    house: "Öffentlicher Bankausblick",
    available: "Verfügbar",
    unavailable: "Nicht verfügbar",
    disabled: "Deaktiviert",
    retrieved: "Abgerufen",
    published: "Veröffentlicht",
    sourceDate: "Datenstand des Herausgebers",
    read: "Quelle lesen",
    more: "Quelldetails ansehen",
    retry: "Quellen erneut laden",
    loading: "Marktquellen werden geladen…",
    error: "Marktquellen konnten nicht geladen werden.",
    missing:
      "Diese Quelle ist derzeit nicht verfügbar. Aktuelle Aussagen werden nicht abgeleitet.",
    newsScope:
      "Allgemeine Wirtschaftsschlagzeilen; die Relevanz für einzelne Positionen muss geprüft werden.",
    houseScope:
      "Öffentliche Einschätzung einer externen Bank, keine interne CIO-Richtlinie deiner Bank oder ein Kundenmandat.",
    dateCaveat:
      "Datenstand und Abrufdatum unterscheiden sich. Ein neuer Abruf macht einen älteren Ausblick nicht aktuell.",
    sourceLanguage: "Quellenauszüge bleiben in der Originalsprache.",
    dateUnknown: "Quelldatum nicht verfügbar",
  },
  fr: {
    title: "Sources de marché",
    news: "Actualités économiques publiques",
    house: "Perspectives bancaires publiques",
    available: "Disponible",
    unavailable: "Indisponible",
    disabled: "Désactivée",
    retrieved: "Consultée",
    published: "Publiée",
    sourceDate: "Date des données de l’éditeur",
    read: "Lire la source",
    more: "Voir les détails des sources",
    retry: "Réessayer les sources",
    loading: "Chargement des sources de marché…",
    error: "Les sources de marché n’ont pas pu être chargées.",
    missing:
      "Cette source est indisponible. Aucune affirmation actuelle n’est déduite.",
    newsScope:
      "Titres économiques généraux ; leur pertinence pour chaque position nécessite un examen.",
    houseScope:
      "Point de vue public d’une banque externe, pas la politique interne de votre banque ni un mandat client.",
    dateCaveat:
      "La date des données diffère de la date de consultation. Une consultation récente ne rend pas actuelles d’anciennes perspectives.",
    sourceLanguage: "Les extraits restent dans leur langue d’origine.",
    dateUnknown: "Date de source indisponible",
  },
};
