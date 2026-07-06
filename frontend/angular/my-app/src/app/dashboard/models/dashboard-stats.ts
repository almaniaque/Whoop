/**
 * Ligne du tableau "Derniers devis" du dashboard.
 * - date : déjà formatée par le backend ("08 janvier 2026")
 * - statut : clé canonique sans accents (ACCEPTE, EN_ATTENTE, EN_COURS,
 *   REFUSE, ANNULE, BROUILLON) — utilisée par getStatutLabel/getStatutClass.
 */
export interface DevisResume {
    id: number;
    clientNom: string;
    date: string;
    montant: number;
    statut: string;
}

/**
 * Réponse de GET /api/dashboard/users/{userId}/dashboard.
 *
 * Les noms de champs doivent rester STRICTEMENT identiques à ceux du
 * DTO Java DashboardStatsDto (backend) : Jackson sérialise avec ces noms,
 * et tout champ renommé d'un seul côté arrive en `undefined` ici, sans
 * erreur de compilation.
 */
export interface DashboardStats {
    totalClients: number;
    totalDevis: number;

    devisEmis: number;
    devisBrouillon: number;
    devisEnAttente: number;
    devisEnCours: number;
    devisRefuses: number;
    devisAnnules: number;
    devisAcceptes: number;

    montantCA: number;
    montantAccepte: number;
    montantPotentiel: number;

    chiffreAffaires: number;
    tauxConversion: number;
    delaiMoyenReponse: number;

    evolutionChiffreAffaires: number;
    evolutionDevis: number;
    evolutionConversion: number;
    evolutionDelai: number;

    moisLabels: string[];
    caParMois: number[];
    devisParMois: number[];
    chiffreAffairesMois: number;

    derniersDevis: DevisResume[];
}
