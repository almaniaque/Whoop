package com.whoopstack.devis.userAuth.config;

import com.whoopstack.devis.userAuth.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

/**
 * Configuration Spring Security de l'application.
 *
 * Modèle retenu : API REST stateless sécurisée par JWT.
 * - Pas de session serveur (STATELESS) : chaque requête doit porter son token.
 * - CSRF désactivé : inutile sans cookie de session (le token est dans un
 *   header, pas un cookie, donc non soumis au CSRF classique).
 * - CORS restreint au frontend Angular (http://localhost:4200).
 * - JwtAuthFilter placé avant le filtre d'authentification standard pour
 *   alimenter le SecurityContext à partir du header Authorization.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics : login, register, forgot/reset password.
                        .requestMatchers("/api/auth/**").permitAll()
                        // /error est la page interne où Spring redirige toute exception.
                        // Si elle reste protégée, une erreur 500 ressort en 403
                        // (le vrai code HTTP est masqué), ce qui rend le debug impossible
                        // côté frontend.
                        .requestMatchers("/error").permitAll()
                        // Tout le reste exige un JWT valide (voir JwtAuthFilter).
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Politique CORS : seule l'origine du dev-server Angular est autorisée.
     * Si le frontend change de port ou passe en production, il faut ajouter
     * la nouvelle origine ici (sinon le navigateur bloque les appels API).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // toutes les routes, pas juste /api/**
        return source;
    }
}