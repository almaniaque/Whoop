package com.whoopstack.devis.userAuth.exception;

import com.whoopstack.devis.userAuth.auth.dto.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralise la traduction des exceptions en réponses HTTP.
 *
 * Avant ce fichier, TOUTES les RuntimeException (mauvais mot de passe,
 * email déjà pris, etc.) remontaient en 500 Internal Server Error, alors
 * que le frontend (login.component.ts, register.component.ts) teste des
 * codes précis comme 401 ou 409 pour afficher le bon message à l'utilisateur.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Erreurs métier attendues : le code HTTP est porté par l'exception (401, 404,
     * 409...).
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<AuthResponse> handleApiException(ApiException ex) {
        AuthResponse body = new AuthResponse(false, ex.getMessage(), null, null, null, null);
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    /**
     * Filet de sécurité pour tout le reste (bug non prévu) → 500, mais avec un
     * corps JSON exploitable.
     *
     * On LOGGE la stack trace complète : sans ça, le 500 est renvoyé au client
     * mais l'exception disparaît totalement des logs du backend, ce qui rend
     * le diagnostic impossible (le client ne reçoit volontairement qu'un
     * message générique pour ne rien divulguer de l'interne).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<AuthResponse> handleUnexpected(Exception ex) {
        log.error("Erreur interne non prévue interceptée par GlobalExceptionHandler", ex);
        AuthResponse body = new AuthResponse(false, "Une erreur interne est survenue.", null, null, null, null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}