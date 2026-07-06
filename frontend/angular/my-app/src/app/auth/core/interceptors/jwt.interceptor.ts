import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur HTTP global (enregistré dans app.config.ts).
 *
 * Rôle actuel : si le backend répond 401 (token expiré ou invalide),
 * on déconnecte l'utilisateur et on le renvoie vers /auth/login.
 *
 * ⚠️ Note : le backend génère bien un JWT au login (AuthService le stocke
 * en localStorage), mais cet intercepteur n'injecte PAS encore le header
 * "Authorization: Bearer <token>" — chaque composant/service le fait
 * manuellement (dashboard.ts, menu-devis.ts, client-list.ts...).
 * Amélioration possible : centraliser l'injection du header ici avec
 * request.clone({ setHeaders: ... }) et supprimer les headers manuels,
 * pour éviter les oublis sur les futurs appels API.
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Token invalide/expiré : purge du localStorage + retour au login.
          this.authService.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
