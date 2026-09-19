import type { Slide } from "./content";
export const fr: Slide[] = [
  {
    kind: "hero",
    label: "UNRISKOMEGA · INTELLIGENCE CONSEILLER",
    title: "Le contexte du portefeuille.\nPrêt pour l’appel.",
    body: "Un assistant de briefing fondé sur les sources pour le prochain échange avec le client.",
    points: ["START Hack Tour · Saint-Gall", "19 septembre 2026"],
    footnote:
      "Démonstration de hackathon construite autour du défi UnRiskOmega fourni.",
    accent: true,
  },
  {
    kind: "problem",
    label: "01 / L’APPEL CLIENT",
    title: "La question arrive.\nLe contexte est dispersé.",
    body: "Le défi : un récit client concis que le conseiller peut lire en environ 60 secondes.",
    points: [
      "Portefeuille et positions",
      "Actualités du marché",
      "Vision du CIO de la banque",
    ],
    footnote:
      "Défi UnRiskOmega, p. 8–12. Le temps de lecture est un objectif, pas un SLA de génération mesuré.",
  },
  {
    kind: "briefing",
    label: "02 / LE BRIEFING",
    title: "Une réponse réfléchie.\nAu même endroit.",
    body: "Sélectionnez le client. Examinez le portefeuille. Préparez la conversation en gardant les sources à portée de main.",
    points: [
      "Évolution",
      "Santé du portefeuille",
      "Perspectives et discussion",
    ],
    footnote:
      "Instantané historique. Les variations de valeur liquidative ne sont pas des rendements vérifiés ; les propositions restent à examiner.",
  },
  {
    kind: "conversation",
    label: "03 / LA QUESTION SUIVANTE",
    title: "Posez une question.\nVoyez l’explication.",
    body: "La même conversation répond avec un graphique, un tableau, une mesure, un diagramme, des sources ou un scénario explicite.",
    points: [
      "Texte et voix lancée par l’utilisateur",
      "Réponses visuelles avec sources",
      "Images générées dans la conversation",
    ],
    footnote:
      "Capture réelle du produit. Les réponses sont revues avant affichage ; cette revue ne garantit pas l’exactitude financière.",
    accent: true,
  },
  {
    kind: "evidence",
    label: "04 / LES SOURCES",
    title: "La source reste\nattachée au récit.",
    body: "Les calculs du portefeuille établissent les faits. Le modèle les explique et une revue séparée contrôle le brouillon.",
    points: [
      "Le périmètre client est conservé",
      "Les données absentes restent visibles",
      "Les actions restent des pistes de discussion",
    ],
    footnote:
      "Les dates des sources et les informations de marché ou visions bancaires manquantes restent explicites.",
  },
  {
    kind: "custody",
    label: "05 / LE PORTEFEUILLE EXTERNE",
    title: "Un relevé externe.\nUne conversation de portefeuille.",
    body: "Le parcours bonus transforme un PDF de conservation en portefeuille virtuel revu, aux côtés du contexte natif.",
    points: [
      "Conserver pages sources et dates de valeur",
      "Rapprocher identifiants et montants",
      "Confirmer avant d’utiliser le portefeuille",
    ],
    footnote:
      "L’import exige une revue. Les positions non résolues doivent rester visibles ; aucun ordre n’est envoyé.",
  },
  {
    kind: "architecture",
    label: "06 / LE SYSTÈME",
    title: "Un parcours contrôlé\ndes données à la réponse.",
    body: "Un processus borné d’agents relie l’espace de travail aux sources du portefeuille et à la revue du modèle via une passerelle unique.",
    points: [
      "Espace Next.js",
      "Backend et données Rust",
      "Orchestration OpenClaw",
      "Noyau Rust · modèle et revue",
    ],
    footnote:
      "Cinq services Azure. Les clés restent dans le noyau ; les résultats du processus ne constituent pas une mémoire persistante.",
  },
  {
    kind: "business",
    label: "07 / HYPOTHÈSE COMMERCIALE",
    title: "Utilisé par les conseillers.\nAcheté par les institutions.",
    body: "Commencer par un parcours de préparation au sein d’une banque ou d’une plateforme de conseil.",
    points: [
      "Chargés de relation et conseillers en investissement",
      "Banques et plateformes de portefeuille",
      "Abonnement plateforme et conseillers actifs",
      "Mesurer préparation et exactitude du briefing",
    ],
    footnote:
      "Hypothèse commerciale. Demande, prix et disposition à payer nécessitent un pilote ; aucune taille de marché ni traction annoncée.",
  },
  {
    kind: "roadmap",
    label: "08 / LIVRAISON ET VALIDATION",
    title: "Un produit fonctionnel.\nUne prochaine étape mesurable.",
    body: "JO a construit la démonstration autour des données fournies, de plusieurs langues et de raisonnements consultables.",
    points: [
      "Briefing, suivi visuel et voix",
      "Graphe des sources et inspection du runtime",
      "Évaluer un nouveau client avec des conseillers",
      "Mesurer compréhension, exactitude et temps",
    ],
    footnote:
      "La démonstration n’établit ni aptitude à la production, ni intégration bancaire approuvée, ni soutien de clients.",
  },
  {
    kind: "closing",
    label: "09 / LA DÉMO",
    title: "Apportez un client test.\nPréparons l’appel.",
    body: "Un partenaire. Un parcours approuvé. Un pilote avec responsables de revue et résultats mesurables.",
    points: [
      "Ouvrir l’espace du conseiller",
      "Examiner les sources d’une réponse",
    ],
    footnote: "START Hack Tour Saint-Gall · Défi UnRiskOmega · JO",
    accent: true,
  },
];
