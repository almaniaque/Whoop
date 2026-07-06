import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Garde des routes PROTÉGÉES (accueil, dashboard, devis, clients...).
 *
 * Laisse passer uniquement si AuthService.isAuthenticated() est vrai,
 * c'est-à-dire userId ET token JWT présents en localStorage.
 * Sinon : redirection vers la page de connexion.
 *
 * Rappel : ce n'est qu'une protection d'AFFICHAGE. La vraie sécurité est
 * côté backend (Spring Security rejette en 403 toute requête sans JWT).
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}
