package com.whoopstack.devis.userAuth.exception;

import org.springframework.http.HttpStatus;

/**
 * Utilisée pour les opérations sur un utilisateur déjà identifié
 * (delete, update email/mot de passe) où l'id ne correspond à personne.
 * Différent de InvalidCredentialsException, qui concerne le login.
 */
public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND); // 404
    }
}
