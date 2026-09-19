import type { RuntimeCopy } from "./types";
export const fr: RuntimeCopy = {
  agents: {
    manager:
      "Sélectionne un processus borné de conseil ou d’explication visuelle pour l’instantané de preuves actuel.",
    "evidence-curator":
      "Attribue des identifiants et des chemins JSON aux preuves de l’exécution ; ne récupère jamais d’instructions externes.",
    "portfolio-analyst":
      "Explique l’allocation, les constats d’adéquation signalés, les risques de l’instantané et la performance indisponible dans la langue demandée.",
    "visual-explainer":
      "Sélectionne des cartes, tableaux et graphiques liés aux preuves ou des diagrammes clairement conceptuels pour la conversation.",
    verifier:
      "Une requête de modèle distincte vérifie le brouillon face aux mêmes preuves après la validation déterministe des composants et des citations.",
    "outcome-owner":
      "Enregistre des résumés bornés et l’état de vérification sans conserver les preuves du client ni le texte de la conversation.",
    "image-designer":
      "Appelle le fournisseur d’images configuré pour une illustration explicitement demandée sans transmettre de preuves du portefeuille.",
  },
  skills: {
    "portfolio-health": [
      "Priorise les constats d’adéquation et les alertes de qualité des données ; conserve leur gravité et ne certifie jamais l’adéquation.",
      "Instantané du portefeuille sélectionné, constats signalés, valeurs de risque et dates de référence",
      "Points de discussion liés aux sources pour examen par le conseiller",
    ],
    "allocation-check": [
      "Compare les pondérations et objectifs fournis sans mélanger unités, taxonomies ou devises.",
      "Lignes d’allocation avec pondération, objectif, minimum, maximum et écart",
      "Tableau ou graphique d’allocation lié aux preuves",
    ],
    "performance-honesty": [
      "Distingue les variations de la série de valeur liquidative fournie des rendements d’investissement et de l’attribution indisponible.",
      "Historique fourni, dates de référence et lacunes de données",
      "Observations précisément qualifiées ou indisponibilité explicite",
    ],
    "evidence-grounding": [
      "Limite les affirmations au périmètre des preuves sélectionnées, avec des sources identifiables et des limites visibles.",
      "Preuves propres à l’exécution et réponse proposée",
      "Identifiants validés, contrôles déterministes et examen indépendant par le modèle",
    ],
    "visual-explanation": [
      "Choisit des composants sémantiques bornés pour expliquer les données fournies sans balisage exécutable.",
      "Question et preuves propres à l’exécution",
      "Indicateur, tableau, graphique, preuve, diagramme conceptuel ou projection explicitement hypothétique",
    ],
    "image-generation": [
      "Génère dans la conversation une image conceptuelle demandée par l’utilisateur via le fournisseur configuré.",
      "Demande visuelle explicite et langue ; aucune preuve du portefeuille",
      "Image PNG identifiée comme illustrative",
    ],
  },
  steps: {
    manager:
      "Sélectionner le spécialiste du conseil ou de la visualisation selon la question, sans outils externes.",
    "evidence-curator":
      "Créer des identifiants de preuves propres à l’exécution depuis l’instantané fourni par le serveur.",
    "portfolio-analyst":
      "Générer une réponse conforme au schéma ; le spécialiste visuel remplace ce rôle pour les demandes visuelles explicites.",
    verifier:
      "Vérifier la structure, l’appartenance des sources et les composants numériques, puis examiner indépendamment le brouillon via une autre requête au modèle.",
    "outcome-owner":
      "Renvoyer accepté ou à examiner et ne conserver qu’un résumé anonyme borné de l’exécution.",
  },
};
