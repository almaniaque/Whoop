package com.whoopstack.devis.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.whoopstack.devis.model.Devis;
import com.whoopstack.devis.model.Prestation;
import com.whoopstack.devis.ressource.DashboardStatsDto;
import com.whoopstack.devis.ressource.DevisResumeDto;

@Service
public class DashboardService {

    private final ClientService clientService;
    private final DevisService devisService;

    public DashboardService(ClientService clientService, DevisService devisService) {
        this.clientService = clientService;
        this.devisService = devisService;
    }

    /**
     * Normalise un statut pour comparaison : trim + suppression des accents
     * + passage en MAJUSCULES.
     *
     * Indispensable car la base contient des statuts saisis en français
     * ("Accepté", "En_attente", "Refusé"...) alors que le dashboard compare
     * des clés canoniques sans accents ("ACCEPTE", "EN_ATTENTE", "REFUSE"...).
     * Sans cette étape, "Accepté".toUpperCase() donne "ACCEPTÉ" (l'accent est
     * conservé), aucun statut ne matche, et tous les compteurs du dashboard
     * restent à zéro alors qu'il y a des devis en base.
     *
     * NFD décompose "é" en "e" + accent combinant, puis \p{M} supprime tous
     * les caractères d'accentuation.
     */
    private static String normaliseStatut(String statut) {
        if (statut == null) {
            return null;
        }
        String sansAccents = Normalizer.normalize(statut.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return sansAccents.toUpperCase(Locale.ROOT);
    }

    /**
     * Calcule le montant total d'un devis.
     *
     * Devis n'a plus de champ "montant" propre : le prix est désormais porté
     * par chaque Prestation (montant unitaire x quantite). Le montant d'un
     * devis est donc la somme des (quantite * montant) de toutes les
     * prestations qui lui sont rattachées (relation ManyToMany
     * devis_prestation).
     *
     * D'où l'appel à devis.getPrestation() ici plutôt qu'un devis.getMontant()
     * qui n'existe plus sur l'entité.
     */
    /**
     * Calcule une évolution en pourcentage entre le mois précédent et le
     * mois courant : ((actuel - precedent) / precedent) * 100.
     *
     * Cas particuliers gérés :
     * - precedent == 0 et actuel > 0 -> 100% (progression depuis zéro)
     * - precedent == 0 et actuel == 0 -> 0% (rien n'a changé)
     */
    private static double pourcentageEvolution(double actuel, double precedent) {
        if (precedent == 0) {
            return actuel == 0 ? 0.0 : 100.0;
        }
        double evolution = ((actuel - precedent) / precedent) * 100;
        return Math.round(evolution * 100.0) / 100.0;
    }

    private static double calculerMontantDevis(Devis devis) {
        if (devis.getPrestation() == null) {
            return 0.0;
        }
        double total = 0.0;
        for (Prestation prestation : devis.getPrestation()) {
            total += (double) prestation.getMontant() * prestation.getQuantite();
        }
        return total;
    }

    /**
     * @Transactional est indispensable ici : la méthode appelle
     *                clientService.getClientsByUserId(...) puis
     *                devisService.getAllDevis(...),
     *                et lit ensuite des associations lazy (d.getClient().getName())
     *                dans le
     *                stream plus bas. Sans transaction englobante, chaque appel de
     *                repository
     *                ouvre/ferme sa propre session Hibernate ; au moment d'accéder
     *                à
     *                d.getClient().getName(), la session qui a chargé "devisList"
     *                est déjà
     *                fermée -> LazyInitializationException (qui remontait
     *                auparavant en 500,
     *                masqué en 403 par Spring Security faute de gestionnaire
     *                d'exceptions).
     *
     *                readOnly = true : légère optimisation Hibernate, cette méthode
     *                ne fait
     *                que lire des données, jamais d'écriture.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getStatsByUserId(Long userId) {
        int totalClients = clientService.getClientsByUserId(userId).size();

        List<Devis> devisList = devisService.getAllDevis(userId);
        int totalDevis = devisList.size();

        int devisBrouillon = 0;
        int devisEnAttente = 0;
        int devisEnCours = 0;
        int devisRefuses = 0;
        int devisAnnules = 0;
        int devisAcceptes = 0;

        double montantCA = 0.0;
        double montantAccepte = 0.0;
        double montantPotentiel = 0.0;
        double chiffreAffairesMois = 0.0;
        List<String> moisLabels = new ArrayList<>();
        List<Double> caParMois = new ArrayList<>();
        List<Integer> devisParMois = new ArrayList<>();
        YearMonth moisActuel = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth mois = moisActuel.minusMonths(i);

            String label = mois.getMonth()
                    .getDisplayName(TextStyle.SHORT, Locale.FRANCE);

            moisLabels.add(label);

            double caMois = 0.0;
            int devisMois = 0;

            for (Devis devis : devisList) {
                LocalDate dateCreation = devis.getDate();

                if (dateCreation == null) {
                    continue;
                }

                YearMonth moisDuDevis = YearMonth.from(dateCreation);

                if (!moisDuDevis.equals(mois)) {
                    continue;
                }

                devisMois++;

                String statut = normaliseStatut(devis.getStatut());
                double montantTotal = calculerMontantDevis(devis);

                if ("ACCEPTE".equals(statut) && montantTotal != 0) {
                    caMois += montantTotal;
                }
            }

            caParMois.add(caMois);
            devisParMois.add(devisMois);
        }

        if (!caParMois.isEmpty()) {
            chiffreAffairesMois = caParMois.get(caParMois.size() - 1);
        }

        for (Devis devis : devisList) {
            double montantTotal = calculerMontantDevis(devis);

            // Total de tous les devis émis
            if (montantTotal != 0) {
                montantCA += montantTotal;
            }

            String statut = normaliseStatut(devis.getStatut());

            if (statut == null) {
                continue;
            }

            switch (statut) {
                case "BROUILLON" -> devisBrouillon++;

                case "EN_ATTENTE" -> {
                    devisEnAttente++;
                    montantPotentiel += montantTotal;
                }

                case "EN_COURS" -> {
                    devisEnCours++;
                    montantPotentiel += montantTotal;
                }

                case "REFUSE" -> devisRefuses++;

                case "ANNULE" -> devisAnnules++;

                case "ACCEPTE" -> {
                    devisAcceptes++;
                    montantAccepte += montantTotal;
                }

                default -> {
                }
            }
        }

        int devisEmis = totalDevis;

        double chiffreAffaires = montantAccepte;

        double tauxConversion = 0.0;
        if (totalDevis > 0) {
            tauxConversion = ((double) devisAcceptes / totalDevis) * 100;
            tauxConversion = Math.round(tauxConversion * 100.0) / 100.0;
        }

        double delaiMoyenReponse = 0.0;

        // Comparaison mois courant vs mois précédent : caParMois/devisParMois
        // sont remplis dans l'ordre chronologique, le dernier élément (index 5)
        // est donc le mois en cours, l'avant-dernier (index 4) le mois précédent.
        double evolutionChiffreAffaires = pourcentageEvolution(
                caParMois.get(5), caParMois.get(4));
        double evolutionDevis = pourcentageEvolution(
                devisParMois.get(5), devisParMois.get(4));

        // TODO : evolutionConversion et evolutionDelai nécessitent des
        // données pas encore calculées par mois (taux de conversion et délai
        // de réponse mensuels) — voir remarque dans la réponse.
        double evolutionConversion = 0.0;
        double evolutionDelai = 0.0;

        // ── 10 derniers devis triés par date décroissante ─────────
        // Le statut est normalisé (ACCEPTE, EN_ATTENTE...) pour correspondre
        // aux clés attendues par le frontend du dashboard
        // (getStatutLabel / getStatutClass dans dashboard.ts).
        List<DevisResumeDto> derniersDevis = devisList.stream()
                .filter(d -> d.getDate() != null)
                .sorted((d1, d2) -> d2.getDate().compareTo(d1.getDate()))
                .limit(10)
                .map(d -> new DevisResumeDto(
                        d.getId(),
                        d.getClient() != null ? d.getClient().getName() : "—",
                        d.getDate(),
                        (int) calculerMontantDevis(d),
                        normaliseStatut(d.getStatut())))
                .collect(Collectors.toList());

        // ⚠️ Le DTO utilise @AllArgsConstructor (Lombok) : l'ordre des arguments
        // DOIT suivre l'ordre de déclaration des champs dans DashboardStatsDto.
        // Un argument mal placé compile sans erreur (tous les montants sont des
        // double) mais décale toutes les valeurs suivantes — c'est exactement
        // le bug qui faussait tauxConversion / delaiMoyenReponse auparavant.
        return new DashboardStatsDto(
                totalClients,
                totalDevis,
                devisEmis,
                devisBrouillon,
                devisEnAttente,
                devisEnCours,
                devisRefuses,
                devisAnnules,
                devisAcceptes,
                montantCA,
                montantAccepte,
                montantPotentiel,
                chiffreAffaires,
                tauxConversion,
                delaiMoyenReponse,
                evolutionChiffreAffaires,
                evolutionDevis,
                evolutionConversion,
                evolutionDelai,
                chiffreAffairesMois,
                moisLabels,
                caParMois,
                devisParMois,
                derniersDevis);
    }
}