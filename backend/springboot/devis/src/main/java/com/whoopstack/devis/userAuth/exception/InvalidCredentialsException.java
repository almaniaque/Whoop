package com.whoopstack.devis.userAuth.exception;

import org.springframework.http.HttpStatus;

/**
 * Levée quand l'email n'existe pas OU que le mot de passe est incorrect.
 * On utilise volontairement le même message dans les deux cas (voir
 * AuthService.login) pour ne pas révéler si un email est enregistré.
 */
public class InvalidCredentialsException extends ApiException {
    public InvalidCredentialsException(String message) {
        super(message, HttpStatus.UNAUTHORIZED); // 401
    }
}
