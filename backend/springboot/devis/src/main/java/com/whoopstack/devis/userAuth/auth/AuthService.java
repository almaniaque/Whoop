package com.whoopstack.devis.userAuth.auth;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.whoopstack.devis.userAuth.auth.dto.*;
import com.whoopstack.devis.userAuth.exception.*;
import com.whoopstack.devis.userAuth.security.JwtService;
import com.whoopstack.devis.userAuth.user.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Logique métier de l'authentification : inscription, connexion,
 * suppression de compte, changement d'email et de mot de passe.
 *
 * Conventions :
 * - Les emails sont toujours normalisés (trim + minuscules) avant
 * d'être comparés ou enregistrés, pour éviter les doublons du type
 * "Foo@Mail.com" / "foo@mail.com".
 * - Les mots de passe ne sont JAMAIS stockés en clair : hachés en BCrypt
 * (voir PasswordConfig), comparés via passwordEncoder.matches().
 * - Les erreurs attendues lèvent des ApiException (401/404/409) traduites
 * par GlobalExceptionHandler.
 */
@Service
public class AuthService {
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp");
    private final JwtService jwtService;

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (appUserRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Cet email existe déja");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setCreatedAt(LocalDateTime.now());

        AppUser savedUser = appUserRepository.save(user);

        // Pas de token ici : l'inscription ne connecte pas automatiquement
        // l'utilisateur, il doit passer par /auth/login pour obtenir un JWT.
        return new AuthResponse(
                true,
                "Compte créé avec succès",
                savedUser.getId(),
                savedUser.getEmail(),
                null,
                savedUser.getPhotoUrl());

    }

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        AppUser user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Même message que ci-dessus volontairement : ne pas révéler
            // si c'est l'email ou le mot de passe qui est faux.
            throw new InvalidCredentialsException("Email ou mot de passe incorrect");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(
                true,
                "Connexion Réussie",
                user.getId(),
                user.getEmail(),
                token,
                user.getPhotoUrl());
    }

    public AuthResponse deleteUser(Long id) {

        if (!appUserRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur introuvable");
        }

        appUserRepository.deleteById(id);

        return new AuthResponse(
                true,
                "Utilisateur supprimé avec succès",
                id,
                null,
                null,
                null);
    }

    public AuthResponse updateUserEmail(Long id, String email) {

        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        String cleanEmail = email.trim().toLowerCase();

        user.setEmail(cleanEmail);

        AppUser savedUser = appUserRepository.save(user);

        return new AuthResponse(
                true,
                "Email modifié avec succès",
                savedUser.getId(),
                savedUser.getEmail(),
                null,
                savedUser.getPhotoUrl());
    }

    public AuthResponse updateNewPassword(Long id, UpdatePasswordRequest request) {

        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(request.getOldMdp(), user.getPassword())) {
            throw new InvalidCredentialsException("Ancien mot de passe incorrect");
        }

        String hashedNewPassword = passwordEncoder.encode(request.getNewMdp());

        user.setPassword(hashedNewPassword);

        AppUser savedUser = appUserRepository.save(user);

        return new AuthResponse(
                true,
                "Mot de passe changé avec succès",
                savedUser.getId(),
                savedUser.getEmail(),
                null,
                savedUser.getPhotoUrl());
    }

    public AuthResponse updateUserPhoto(Long id, MultipartFile file) {

        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Aucun fichier envoyé");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("Format d'image non supporté (jpg, jpeg, png, webp uniquement)");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String filename = "user_" + id + "_" + UUID.randomUUID() + extension;
            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            if (user.getPhotoUrl() != null) {
                Path oldFile = uploadPath.resolve(Paths.get(user.getPhotoUrl()).getFileName());
                Files.deleteIfExists(oldFile);
            }

            user.setPhotoUrl("/uploads/photos/" + filename);
            AppUser savedUser = appUserRepository.save(user);

            return new AuthResponse(
                    true,
                    "Photo mise à jour avec succès",
                    savedUser.getId(),
                    savedUser.getEmail(),
                    null,
                    savedUser.getPhotoUrl());

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo", e);
        }
    }

    public ProfileResponse getProfile(Long id) {

        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        return new ProfileResponse(
                true,
                "Profil récupéré avec succès",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNbSiret(),
                user.getTelephone(),
                user.getAdresse(),
                user.getPhotoUrl());
    }

    public ProfileResponse updateProfile(Long id, UpdateProfileRequest request) {

        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        user.setName(request.getName());
        user.setNbSiret(request.getNbSiret());
        user.setTelephone(request.getTelephone());
        user.setAdresse(request.getAdresse());

        AppUser savedUser = appUserRepository.save(user);

        return new ProfileResponse(
                true,
                "Profil mis à jour avec succès",
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getNbSiret(),
                savedUser.getTelephone(),
                savedUser.getAdresse(),
                savedUser.getPhotoUrl());
    }

}