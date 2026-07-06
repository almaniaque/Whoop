package com.whoopstack.devis.userAuth.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Accès aux utilisateurs. Les deux méthodes sont dérivées automatiquement
 * par Spring Data à partir de leur nom (requêtes sur la colonne email).
 * L'email étant normalisé en minuscules à l'écriture, penser à normaliser
 * aussi le paramètre avant l'appel (fait dans AuthService).
 */
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    /** Utilisé au login et pour le mot de passe oublié. */
    Optional<AppUser> findByEmail(String email);

    /** Utilisé à l'inscription pour refuser les doublons (409). */
    public boolean existsByEmail(String email);
}
