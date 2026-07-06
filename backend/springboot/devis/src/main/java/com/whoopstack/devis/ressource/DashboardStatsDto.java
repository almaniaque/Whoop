package com.whoopstack.devis.ressource;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO renvoyé par GET /api/dashboard/users/{userId}/dashboard.
 *
 * //@AllArgsConstructor (Lombok) génère un constructeur dont les paramètres
 * suivent l'ORDRE DE DÉCLARATION des champs ci-dessous. Si on réordonne les
 * champs ou l'appel dans DashboardService sans synchroniser les deux, les
 * valeurs se décalent silencieusement (tout compile, tout est faux).
 *
 * Les noms de champs doivent rester alignés avec l'interface TypeScript
 * DashboardStats (frontend : dashboard/models/dashboard-stats.ts) car
 * Jackson sérialise en JSON avec ces noms exacts.
 */
@Setter
@Getter
@AllArgsConstructor
public class DashboardStatsDto {

    private int totalClients;
    private int totalDevis;

    private int devisEmis;
    private int devisBrouillon;
    private int devisEnAttente;
    private int devisEnCours;
    private int devisRefuses;
    private int devisAnnules;
    private int devisAcceptes;

    // "montantCA" (et non montantTotal) : le modèle Angular DashboardStats
    // attend cette clé JSON. Total de tous les devis émis, quel que soit
    // leur statut.
    private double montantCA;
    private double montantAccepte;
    private double montantPotentiel;

    private double chiffreAffaires;
    private double tauxConversion;
    private double delaiMoyenReponse;

    private double evolutionChiffreAffaires;
    private double evolutionDevis;
    private double evolutionConversion;
    private double evolutionDelai;
    private double chiffreAffairesMois;

    private List<String> moisLabels;
    private List<Double> caParMois;
    private List<Integer> devisParMois;

    private List<DevisResumeDto> derniersDevis;

    public DashboardStatsDto() {
    }

}
