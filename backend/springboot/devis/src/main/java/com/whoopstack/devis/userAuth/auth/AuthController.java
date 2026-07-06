package com.whoopstack.devis.userAuth.auth;

import org.springframework.web.bind.annotation.*;

import com.whoopstack.devis.userAuth.auth.dto.*;

import com.whoopstack.devis.userAuth.passwordReset.PasswordResetService;
import org.springframework.web.multipart.MultipartFile;

/**
 * Endpoints d'authentification et de gestion de compte.
 *
 * Toutes les routes /api/auth/** sont PUBLIQUES (permitAll dans
 * SecurityConfig) : c'est ici qu'on obtient le JWT nécessaire au reste
 * de l'API. Toutes les réponses utilisent l'enveloppe AuthResponse
 * { success, message, userId, email, token }.
 *
 * Les erreurs métier (email déjà pris, mauvais mot de passe...) sont
 * levées par les services sous forme d'ApiException et traduites en
 * codes HTTP par GlobalExceptionHandler (409, 401, 404...).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    /**
     * Inscription. Ne connecte PAS l'utilisateur (token = null) : il doit ensuite
     * passer par /login.
     */
    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Connexion : vérifie email + mot de passe et renvoie le JWT dans
     * AuthResponse.token.
     */
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Suppression définitive du compte. */
    @DeleteMapping("/user/{id}")
    public AuthResponse deleteUser(@PathVariable Long id) {
        return authService.deleteUser(id);
    }

    /**
     * Changement d'email. Réutilise RegisterRequest : seul le champ email est lu.
     */
    @PutMapping("/user/{id}/email")
    public AuthResponse updateUserEmail(@PathVariable Long id, @RequestBody RegisterRequest request) {
        return authService.updateUserEmail(id, request.getEmail());
    }

    /**
     * Changement de mot de passe pour un utilisateur connecté (exige l'ancien mot
     * de passe).
     */
    @PutMapping("/user/{id}/password")
    public AuthResponse updateNewPassword(
            @PathVariable Long id,
            @RequestBody UpdatePasswordRequest request) {
        return authService.updateNewPassword(id, request);
    }

    @PostMapping("/user/{id}/photo")
    public AuthResponse uploadUserPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        return authService.updateUserPhoto(id, photo);
    }

    @GetMapping("/user/{id}")
    public ProfileResponse getProfile(@PathVariable Long id) {
        return authService.getProfile(id);
    }

    @PutMapping("/user/{id}/profile")
    public ProfileResponse updateProfile(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(id, request);
    }

    /**
     * Demande de réinitialisation (mot de passe oublié).
     * Répond toujours success=true, même si l'email est inconnu, pour ne pas
     * révéler quels emails ont un compte. Le lien de reset est pour l'instant
     * affiché dans la console du backend (pas d'envoi de mail).
     */
    @PostMapping("/forgot-password")
    public AuthResponse forgotpassword(@RequestBody ForgotPasswordRequest request) {

        return passwordResetService.requestPasswordReset(request);
    }

    /** Réinitialisation effective : consomme le token reçu via /forgot-password. */
    @PostMapping("/reset-password")
    public AuthResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        return passwordResetService.resetPassword(request);
    }
}
