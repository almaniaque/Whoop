package com.whoopstack.devis.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.whoopstack.devis.ressource.DashboardStatsDto;
import com.whoopstack.devis.service.DashboardService;

/**
 * Endpoint unique du dashboard.
 *
 * GET /api/dashboard/users/{userId}/dashboard
 * -> renvoie toutes les statistiques agrégées de l'utilisateur en un seul
 *    appel (compteurs par statut, chiffre d'affaires, séries sur 6 mois,
 *    10 derniers devis). Voir DashboardStatsDto pour le format exact.
 *
 * Route protégée : exige un header "Authorization: Bearer <jwt>"
 * (voir SecurityConfig / JwtAuthFilter).
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/users/{userId}/dashboard")
    public DashboardStatsDto getDashboardByUserId(@PathVariable Long userId) {

        return dashboardService.getStatsByUserId(userId);
    }
}
