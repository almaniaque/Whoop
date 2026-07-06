package com.whoopstack.devis.userAuth.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception métier de base : porte le message ET le code HTTP à renvoyer.
 * Toutes les exceptions "attendues" (mauvais mot de passe, email déjà pris,
 * ressource introuvable, token invalide...) doivent en hériter au lieu
 * d'utiliser RuntimeException directement, sinon elles remontent en 500
 * par défaut chez Spring.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
