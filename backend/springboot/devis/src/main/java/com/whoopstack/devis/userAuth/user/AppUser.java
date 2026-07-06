package com.whoopstack.devis.userAuth.user;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/**
 * Utilisateur de l'application (le freelance).
 * Table "app_user" — propriétaire des clients et des devis
 * (relations ManyToOne depuis Client et Devis via user_id).
 */
@Entity
@AllArgsConstructor
@Setter
@Getter
@Table
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Identifiant de connexion. Toujours stocké en minuscules (voir AuthService).
     */
    private String email;

    // Informations de profil facultatives (remplies plus tard via Paramètres).
    private String name;
    private String nbSiret;
    private String adresse;
    private String telephone;
    private String photoUrl;
    /** Hash BCrypt — jamais le mot de passe en clair. */
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Champs prévus mais pas encore alimentés par le code.
    private LocalDate lastLoginAt;
    private String activate;

    public AppUser() {

    }
}
