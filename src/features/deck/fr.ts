import type { Slide } from "./content";
export const fr: Slide[] = [
  {
    label: "01 / UNRISKOMEGA",
    title: "Le contexte du portefeuille.\nPrêt pour l’échange.",
    body: "Un compagnon qui transforme les instantanés de portefeuille en synthèses concises et traçables.",
    points: ["START Hack Tour St. Gallen", "19 septembre 2026"],
    footnote:
      "Démonstration du hackathon avec les données fournies pour le défi.",
    accent: true,
  },
  {
    label: "02 / LE PROBLÈME",
    title: "Le client appelle.\nLe contexte est dispersé.",
    body: "Le conseiller doit relier positions, limites d’allocation et contexte avant de parler clairement du portefeuille.",
    points: [
      "Rapprocher les détails financiers prend du temps.",
      "Une synthèse fluide peut masquer des sources manquantes.",
    ],
    footnote: "Problème tiré du défi UnRiskOmega fourni, pages 8–10.",
  },
  {
    label: "03 / LA SOLUTION",
    title: "Un portefeuille.\nUne synthèse réfléchie.",
    body: "Sélectionnez un portefeuille et examinez son évolution, sa santé et ses perspectives avec l’instantané source.",
    points: [
      "Inspectez l’allocation et les constats enregistrés.",
      "Approfondissez vos questions par texte ou voix.",
    ],
    footnote:
      "La démo dépend des services connectés et de la disponibilité des modèles.",
  },
  {
    label: "04 / LA DIFFÉRENCE",
    title: "Les sources restent\nà portée de main.",
    body: "Les calculs déterministes établissent les faits. L’IA aide à les expliquer dans le contexte du client sélectionné.",
    points: [
      "L’historique indisponible reste indisponible.",
      "Le conseiller examine chaque proposition de discussion.",
    ],
    footnote:
      "Aucun trading autonome, certification d’adéquation ou rendement promis.",
  },
  {
    label: "05 / CLIENTS",
    title: "Conçu autour\ndu travail du conseiller.",
    body: "Les premiers utilisateurs envisagés sont les chargés de relation et conseillers utilisant des plateformes de portefeuille.",
    points: [
      "Hypothèse d’acheteur : banques et plateformes de conseil.",
      "Première validation : un parcours avec un petit groupe.",
    ],
    footnote: "Demande, taille du marché et consentement à payer non validés.",
  },
  {
    label: "06 / MODÈLE ÉCONOMIQUE",
    title: "Une licence de plateforme.\nUne valeur en préparation.",
    body: "Tester un abonnement banque ou plateforme avec une composante par conseiller actif, après un pilote délimité.",
    points: [
      "Mesurer le temps de préparation et les synthèses acceptées.",
      "Inclure les coûts de modèles, données, infrastructure et examen.",
    ],
    footnote:
      "Hypothèse commerciale. Aucun prix, revenu ou client signé annoncé.",
  },
  {
    label: "07 / ARCHITECTURE",
    title: "Des services délimités.\nUne passerelle IA contrôlée.",
    body: "Next.js se connecte aux services Rust par HTTP authentifié et WebSockets. Les services internes utilisent gRPC.",
    points: [
      "AI core conserve les clés. OpenClaw appelle AI core.",
      "WebRTC porte la voix initiée par l’utilisateur. Azure héberge les conteneurs.",
    ],
    footnote:
      "Le navigateur et covenant ne reçoivent pas la clé API du fournisseur.",
  },
  {
    label: "08 / POSITIONNEMENT",
    title: "Une couche de synthèse\ndans le travail de portefeuille.",
    body: "L’hypothèse relie l’analyse existante à une préparation client lisible et vérifiable.",
    points: [
      "Les systèmes de portefeuille restent la source de référence.",
      "Un chat générique seul n’établit pas les preuves du portefeuille.",
    ],
    footnote:
      "Hypothèse de positionnement, pas une unicité concurrentielle vérifiée.",
  },
  {
    label: "09 / LIVRAISON & ÉQUIPE",
    title: "Une démonstration fonctionnelle.\nPuis un pilote ciblé.",
    body: "JO dirige cette réalisation. Prochaine étape : évaluer avec un partenaire autorisé et des responsables de validation.",
    points: [
      "Maintenant : données du défi, espace multilingue et intégration.",
      "Ensuite : nouveaux clients, compréhension et revue de sécurité.",
    ],
    footnote:
      "Aucun soutien de partenaire, traction client ou certification de production annoncé.",
  },
  {
    label: "10 / INVITATION",
    title: "Testons un meilleur\néchange avec le client.",
    body: "Un partenaire. Un parcours approuvé. Un pilote mesuré avec des critères clairs de validation et de sortie.",
    points: [
      "Comparer le temps de préparation et l’exactitude factuelle.",
      "Élargir après usage répété et preuves de qualité.",
    ],
    footnote: "Ouvrez l’espace pour explorer la démonstration du défi.",
    accent: true,
  },
];
