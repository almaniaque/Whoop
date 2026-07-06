package com.whoopstack.devis.userAuth.auth.dto;

/**
 * Enveloppe de réponse unique pour TOUS les endpoints /api/auth/**
 * (et pour les erreurs via GlobalExceptionHandler).
 *
 * - success : true/false, testé par le frontend avant d'exploiter le reste
 * - message : message lisible affiché à l'utilisateur
 * - userId / email : renseignés quand l'opération concerne un compte
 * - token : JWT — renseigné UNIQUEMENT par /login (null partout ailleurs)
 *
 * Doit rester aligné avec l'interface TypeScript AuthResponse
 * (frontend : auth/core/services/auth.service.ts).
 */
public class AuthResponse {
    private Boolean success;
    private String message;
    private Long userId;
    private String email;
    private String token;
    private String photoUrl;

    public AuthResponse() {

    }

    public AuthResponse(Boolean success, String message, Long userId, String email, String token, String photoUrl) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.token = token;
        this.photoUrl = photoUrl;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

}
