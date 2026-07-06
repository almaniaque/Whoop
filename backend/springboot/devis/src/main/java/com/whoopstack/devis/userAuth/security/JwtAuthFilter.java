package com.whoopstack.devis.userAuth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtre exécuté une fois par requête HTTP, AVANT Spring Security
 * (enregistré dans SecurityConfig via addFilterBefore).
 *
 * Rôle : lire le header "Authorization: Bearer <jwt>", vérifier le token
 * (signature + expiration) et, s'il est valide, poser une Authentication
 * dans le SecurityContext avec l'id utilisateur comme principal.
 *
 * Si le token est absent ou invalide, on N'INTERROMPT PAS la requête ici :
 * on laisse la chaîne continuer sans Authentication, et c'est la règle
 * anyRequest().authenticated() de SecurityConfig qui renverra 403.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // retire le préfixe "Bearer "

            if (jwtService.isTokenValid(token)) {
                Long userId = jwtService.extractUserId(token);

                // Principal = userId (Long). Pas de rôles pour l'instant,
                // d'où la liste d'autorités vide.
                var authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // TODO sécurité : les contrôleurs font confiance au {userId} présent
        // dans l'URL (/api/.../users/{userId}/...) sans vérifier qu'il
        // correspond au userId du token. N'importe quel utilisateur connecté
        // peut donc lire les données d'un autre en changeant l'id dans l'URL.
        // Piste : comparer le {userId} du chemin avec le principal, ou ne
        // plus passer l'id dans l'URL et le déduire du SecurityContext.
        filterChain.doFilter(request, response);
    }
}