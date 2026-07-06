package com.whoopstack.devis.userAuth.auth.mail;

import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails — VOLONTAIREMENT VIDE pour l'instant.
 *
 * Le flux "mot de passe oublié" n'envoie pas encore de vrai mail :
 * PasswordResetService affiche le lien de réinitialisation dans la
 * console du backend (System.out). Quand un serveur SMTP sera disponible,
 * implémenter ici l'envoi (spring-boot-starter-mail) et remplacer le
 * System.out de PasswordResetService par un appel à ce service.
 */
@Service
public class MailService {

}
