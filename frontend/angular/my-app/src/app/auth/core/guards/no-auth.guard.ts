import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Garde inverse de AuthGuard : réservée aux pages PUBLIQUES d'auth
 * (login, register, forgot/reset password).
 *
 * Un utilisateur déjà connecté n'a rien à faire sur ces pages :
 * on le renvoie directement vers l'accueil.
 */
@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): boolean {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/accueil']);
            return false;
        }
        return true;
    }
}