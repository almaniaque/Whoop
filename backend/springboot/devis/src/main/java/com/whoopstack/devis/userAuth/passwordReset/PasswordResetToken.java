package com.whoopstack.devis.userAuth.passwordReset;

import java.time.LocalDateTime;

import com.whoopstack.devis.userAuth.user.AppUser;

import jakarta.persistence.*;

/**
 * Token de réinitialisation de mot de passe (flux "mot de passe oublié").
 *
 * Sécurité : on ne stocke JAMAIS le token en clair, uniquement son hash
 * SHA-256 (tokenHash). Le token brut n'existe que dans le lien envoyé à
 * l'utilisateur ; si la base fuite, les tokens restent inutilisables.
 *
 * Un token est valable 20 minutes (expiresAt) et à usage unique
 * (used/usedAt). Voir PasswordResetService pour le cycle complet.
 */
@Entity
@Table(name = "password_reset_token")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", nullable = false, unique = true, length = 128)
    private String tokenHash;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "expire_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used;

    @Column(name = "creat_at", nullable = false)
    private LocalDateTime createAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public PasswordResetToken() {

    }

    public PasswordResetToken(Long id, String tokenHash, AppUser user, LocalDateTime expiresAt, boolean used,
            LocalDateTime createAt, LocalDateTime usedAt) {
        this.id = id;
        this.tokenHash = tokenHash;
        this.user = user;
        this.expiresAt = expiresAt;
        this.used = used;
        this.createAt = createAt;
        this.usedAt = usedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

}
