package com.whoopstack.devis.userAuth.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Gestion des JWT (bibliothèque JJWT 0.12).
 *
 * Cycle de vie du token :
 * 1. AuthService.login() appelle generateToken() -> le token est renvoyé
 *    au frontend dans AuthResponse.token.
 * 2. Le frontend le stocke en localStorage et l'envoie à chaque requête
 *    dans le header "Authorization: Bearer <token>".
 * 3. JwtAuthFilter appelle isTokenValid() puis extractUserId() pour
 *    authentifier la requête.
 *
 * Le token est signé en HMAC (HS256) avec jwt.secret (application.properties),
 * expire après jwt.expiration-ms (24 h par défaut) et contient :
 * - subject : l'id de l'utilisateur (sous forme de String)
 * - claim "email" : l'email de l'utilisateur
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Construit la clé de signature à partir du secret brut.
     * ⚠️ Le secret doit faire au moins 32 caractères (256 bits) sinon
     * JJWT lève une WeakKeyException au démarrage.
     */
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** Génère un token signé pour l'utilisateur (appelé uniquement au login). */
    public String generateToken(Long userId, String email) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    /**
     * Extrait l'id utilisateur du subject. À n'appeler qu'après
     * isTokenValid() : parseSignedClaims lève une exception si la
     * signature est invalide ou le token expiré.
     */
    public Long extractUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        return Long.valueOf(subject);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // ⚠️ TEMPORAIRE — à retirer une fois le diagnostic terminé.
            // On affiche enfin la vraie cause de l'échec de validation,
            // au lieu de la faire disparaître silencieusement.
            System.err.println("=== ECHEC VALIDATION JWT ===");
            System.err.println("Type d'exception : " + e.getClass().getName());
            System.err.println("Message : " + e.getMessage());
            System.err.println("Longueur du secret configuré (jwt.secret) : "
                    + (secret != null ? secret.length() : 0) + " caractères");
            e.printStackTrace();
            return false;
        }
    }
}