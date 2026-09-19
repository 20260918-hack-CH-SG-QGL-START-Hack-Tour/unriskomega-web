import type { Locale, Messages } from "./index";
export function gapLabel(code: string, t: Messages) {
  const labels: Record<string, string> = {
    SNAPSHOT_NOT_LIVE: t.gapSnapshot,
    NAV_IS_NOT_INVESTMENT_RETURN: t.gapNav,
    PERFORMANCE_YTD_UNAVAILABLE: t.noHistory,
    EXTERNAL_NEWS_UNAVAILABLE: t.gapNews,
    HOUSE_VIEW_UNAVAILABLE: t.gapHouse,
    ACCOUNTS_REQUIRE_CLASSIFICATION: t.gapAccounts,
  };
  return labels[code] ?? code;
}
export function assetLabel(label: string, t: Messages) {
  const labels: Record<string, string> = {
    Shares: t.assetEquity,
    Bonds: t.assetBond,
    "Real estate": t.assetRealEstate,
    "Specialties andCommodities": t.assetSpecialties,
    "Unclassified accounts": t.assetUnclassified,
  };
  return labels[label] ?? label;
}
const terms: Record<string, [string, string, string]> = {
  "Cluster risk of a single financial instrument": [
    "Concentración en un único instrumento",
    "Konzentrationsrisiko eines Finanzinstruments",
    "Concentration sur un seul instrument",
  ],
  "Compliance with maximum volatility": [
    "Cumplimiento de la volatilidad máxima",
    "Einhaltung der maximalen Volatilität",
    "Respect de la volatilité maximale",
  ],
  "Foreign currency exposure exceeds 50%": [
    "Exposición a divisas superior al 50 %",
    "Fremdwährungsexposure über 50 %",
    "Exposition aux devises supérieure à 50 %",
  ],
  "Foreign currency cluster risk": [
    "Concentración en divisa",
    "Fremdwährungskonzentration",
    "Concentration en devise",
  ],
  "Knowledge of portfolio funds and mixed funds": [
    "Conocimiento de fondos de cartera y mixtos",
    "Kenntnisse zu Portfolio- und Mischfonds",
    "Connaissance des fonds de portefeuille et mixtes",
  ],
  "Knowledge of structured products": [
    "Conocimiento de productos estructurados",
    "Kenntnisse zu strukturierten Produkten",
    "Connaissance des produits structurés",
  ],
  "Maximum limit liquidity": [
    "Límite máximo de liquidez",
    "Maximale Liquiditätsgrenze",
    "Limite maximale de liquidités",
  ],
  "Minimum limit fixed income": [
    "Límite mínimo de renta fija",
    "Mindestgrenze für Anleihen",
    "Limite minimale d’obligations",
  ],
  "Minimum limit shares": [
    "Límite mínimo de renta variable",
    "Mindestgrenze für Aktien",
    "Limite minimale d’actions",
  ],
  "Volatility range exceeded (portfolio risk too high)": [
    "Volatilidad por encima del rango (riesgo elevado)",
    "Volatilitätsband überschritten (zu hohes Portfoliorisiko)",
    "Volatilité au-dessus de la fourchette (risque trop élevé)",
  ],
  "Volatility range undershot (portfolio risk too low)": [
    "Volatilidad por debajo del rango (riesgo bajo)",
    "Volatilitätsband unterschritten (zu niedriges Portfoliorisiko)",
    "Volatilité sous la fourchette (risque trop faible)",
  ],
  "Anlagevorschlag ohne Auftraggeber": [
    "Propuesta de inversión sin solicitante",
    "Anlagevorschlag ohne Auftraggeber",
    "Proposition d’investissement sans mandant",
  ],
  "Share is not part of the investment universe for individual shares and therefore not monitored.":
    [
      "La acción está fuera del universo de inversión y no se supervisa.",
      "Die Aktie liegt außerhalb des Anlageuniversums und wird nicht überwacht.",
      "L’action est hors de l’univers d’investissement et n’est pas suivie.",
    ],
  "Significant overweight in the equity region": [
    "Sobreponderación significativa en la región de renta variable",
    "Deutliche Übergewichtung in der Aktienregion",
    "Surpondération significative dans la région actions",
  ],
  "Significant underweight in the equity region": [
    "Infraponderación significativa en la región de renta variable",
    "Deutliche Untergewichtung in der Aktienregion",
    "Sous-pondération significative dans la région actions",
  ],
  "Significant overweight in the equity sector": [
    "Sobreponderación significativa en el sector de renta variable",
    "Deutliche Übergewichtung im Aktiensektor",
    "Surpondération significative dans le secteur actions",
  ],
  "Significant underweight in the equity sector": [
    "Infraponderación significativa en el sector de renta variable",
    "Deutliche Untergewichtung im Aktiensektor",
    "Sous-pondération significative dans le secteur actions",
  ],
  "Overweight in the equity region": [
    "Sobreponderación en la región de renta variable",
    "Übergewichtung in der Aktienregion",
    "Surpondération dans la région actions",
  ],
  "Underweight in the equity region": [
    "Infraponderación en la región de renta variable",
    "Untergewichtung in der Aktienregion",
    "Sous-pondération dans la région actions",
  ],
  "Overweight in the equity sector": [
    "Sobreponderación en el sector de renta variable",
    "Übergewichtung im Aktiensektor",
    "Surpondération dans le secteur actions",
  ],
  "Underweight in the equity sector": [
    "Infraponderación en el sector de renta variable",
    "Untergewichtung im Aktiensektor",
    "Sous-pondération dans le secteur actions",
  ],
  "North America": ["América del Norte", "Nordamerika", "Amérique du Nord"],
  "Rest of Europe": ["Resto de Europa", "Übriges Europa", "Reste de l’Europe"],
  Switzerland: ["Suiza", "Schweiz", "Suisse"],
  Japan: ["Japón", "Japan", "Japon"],
  "Asia/Pacific (ex Japan)": [
    "Asia/Pacífico (sin Japón)",
    "Asien/Pazifik (ohne Japan)",
    "Asie/Pacifique (hors Japon)",
  ],
  "Consumer Discretionary": [
    "Consumo discrecional",
    "Zyklischer Konsum",
    "Consommation discrétionnaire",
  ],
  "Consumer Staples": ["Consumo básico", "Basiskonsum", "Consommation de base"],
  "Communication Services": [
    "Servicios de comunicación",
    "Kommunikationsdienste",
    "Services de communication",
  ],
  "Information Technology": [
    "Tecnología de la información",
    "Informationstechnologie",
    "Technologies de l’information",
  ],
  Financials: ["Finanzas", "Finanzwerte", "Finance"],
  "Health Care": ["Salud", "Gesundheitswesen", "Santé"],
  Industrials: ["Industria", "Industrie", "Industrie"],
  Materials: ["Materiales", "Grundstoffe", "Matériaux"],
  Utilities: ["Servicios públicos", "Versorger", "Services collectifs"],
  Energy: ["Energía", "Energie", "Énergie"],
};
export function findingLabel(source: string, locale: Locale) {
  if (locale === "en")
    return source === "Anlagevorschlag ohne Auftraggeber"
      ? "Investment proposal without an instructing party"
      : source;
  const index = { es: 0, de: 1, fr: 2 }[locale];
  let text = source;
  for (const [term, translations] of Object.entries(terms))
    text = text.replace(term, translations[index]);
  return text;
}
