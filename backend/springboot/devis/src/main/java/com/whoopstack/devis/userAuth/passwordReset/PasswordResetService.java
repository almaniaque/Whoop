package com.whoopstack.devis.userAuth.passwordReset;

import com.whoopstack.devis.userAuth.auth.dto.AuthResponse;
import com.whoopstack.devis.userAuth.auth.dto.ForgotPasswordRequest;
import com.whoopstack.devis.userAuth.auth.dto.ResetPasswordRequest;
import com.whoopstack.devis.userAuth.exception.InvalidResetTokenException;
import com.whoopstack.devis.userAuth.user.AppUser;
import com.whoopstack.devis.userAuth.user.AppUserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetService {
    private final AppUserRepository appUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
            AppUserRepository appUserRepository,
            PasswordResetTokenRepository passwordResetTokenRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse requestPasswordReset(ForgotPasswordRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        appUserRepository.findByEmail(email).ifPresent(user -> {
            String rawToken = generateToken();
            String tokenHash = hashToken(rawToken);

            PasswordResetToken resetToken = new PasswordResetToken();

            resetToken.setUser(user);
            resetToken.setTokenHash(tokenHash);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
            resetToken.setUsed(false);
            resetToken.setCreateAt(LocalDateTime.now());

            passwordResetTokenRepository.save(resetToken);

            System.out.println("lien de reset temporaire");
            System.out.println("http://localhost:4200/reset-password?token=" + rawToken);
        });
        return new AuthResponse(
                true,
                "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé",
                null,
                null,
                null,
                null);

    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));

            }
            return hex.toString();

        } catch (Exception e) {
            // Erreur de plateforme (SHA-256 toujours dispo en pratique) :
            // pas une faute de l'utilisateur, on laisse remonter en 500
            // via le handler générique.
            throw new RuntimeException("Erreur lors du hash du token", e);
        }
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken());

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidResetTokenException("Token invalide"));

        if (resetToken.isUsed()) {
            throw new InvalidResetTokenException("Token déjà utilisé");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidResetTokenException("Token expiré");
        }

        AppUser user = resetToken.getUser();

        String hashedPassword = passwordEncoder.encode(request.getNewPassword());

        user.setPassword(hashedPassword);

        appUserRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());

        passwordResetTokenRepository.save(resetToken);

        return new AuthResponse(
                true,
                "Mot de passe réinitialisé avec succès",
                user.getId(),
                user.getEmail(),
                null,
                null);
    }
}
