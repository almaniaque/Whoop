package com.whoopstack.devis.userAuth.passwordReset;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // ⚠️ Méthode piège : malgré son nom, elle requête la clé primaire (id)
    // avec un String — elle ne cherche PAS par hash et n'est utilisée nulle
    // part. À supprimer à l'occasion ; utiliser findByTokenHash ci-dessous.
    Optional<PasswordResetToken> findById(String tokenHash);

    /** Recherche par hash SHA-256 du token (voir PasswordResetService.hashToken). */
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
