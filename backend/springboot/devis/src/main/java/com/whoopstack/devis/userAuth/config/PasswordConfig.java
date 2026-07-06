package com.whoopstack.devis.userAuth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Fournit l'encodeur de mots de passe utilisé partout dans l'application
 * (inscription, login, changement et réinitialisation de mot de passe).
 *
 * BCrypt : hachage lent avec sel intégré — le même mot de passe donne un
 * hash différent à chaque appel, et la vérification se fait via
 * passwordEncoder.matches(clair, hash), jamais par comparaison directe.
 *
 * Bean séparé de SecurityConfig pour éviter un cycle de dépendances
 * (SecurityConfig dépend de JwtAuthFilter, et les services d'auth
 * dépendent du PasswordEncoder).
 */
@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}