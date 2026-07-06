import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError } from 'rxjs';

// ── Requêtes ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

/** Le backend n'utilise que email + password (pas de firstName/lastName) */
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/** PUT /api/auth/user/{id}/password → { oldMdp, newMdp } */
export interface UpdatePasswordRequest {
  oldMdp: string;
  newMdp: string;
}

/** PUT /api/auth/user/{id}/profile → { name, nbSiret, telephone, adresse } */
export interface UpdateProfileRequest {
  name: string;
  nbSiret: string;
  telephone: string;
  adresse: string;
}

// ── Réponse ───────────────────────────────────────────────────────────────────

/** Réponse unifiée du backend : success + message + userId + email + token (JWT) + photoUrl */
export interface AuthResponse {
  success: boolean;
  message: string;
  userId: number | null;
  email: string | null;
  token: string | null;
  photoUrl: string | null;
}

/** Réponse du profil complet (GET/PUT /api/auth/user/{id}/profile) */
export interface ProfileResponse {
  success: boolean;
  message: string;
  userId: number | null;
  email: string | null;
  name: string | null;
  nbSiret: string | null;
  telephone: string | null;
  adresse: string | null;
  photoUrl: string | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient, private router: Router) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
      tap((res) => {
        if (res.success) {
          this.setSession(res);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
      tap((res) => {
        // ⚠️ Le backend ne génère PAS de JWT lors de l'inscription (token = null).
        // On ne stocke donc que l'info utilisateur ; l'utilisateur devra se
        // connecter via /auth/login pour obtenir un token et accéder aux
        // routes protégées. Voir RegisterComponent pour la redirection.
        if (res.success) {
          localStorage.setItem('userId', String(res.userId));
          localStorage.setItem('user', JSON.stringify({ email: res.email, userId: res.userId }));
        }
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/reset-password`, request);
  }

  /**
   * Changement de mot de passe pour un utilisateur connecté.
   * PUT /api/auth/user/{id}/password
   */
  changePassword(request: UpdatePasswordRequest): Observable<AuthResponse> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('Utilisateur non connecté');
    }
    return this.http.put<AuthResponse>(
      `${this.API_URL}/user/${userId}/password`,
      request
    );
  }

  /**
   * Upload de la photo de profil.
   * POST /api/auth/user/{id}/photo (multipart/form-data)
   */
  uploadPhoto(file: File): Observable<AuthResponse> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post<AuthResponse>(
      `${this.API_URL}/user/${userId}/photo`,
      formData
    ).pipe(
      tap((res) => {
        if (res.success) {
          const stored = localStorage.getItem('user');
          const user = stored ? JSON.parse(stored) : {};
          user.photoUrl = res.photoUrl;
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  /** Renvoie l'URL de la photo stockée localement, ou null */
  getPhotoUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user.photoUrl ?? null;
  }

  /** Renvoie l'URL absolue (backend + chemin) prête à mettre dans un <img [src]> */
  getPhotoFullUrl(): string | null {
    const path = this.getPhotoUrl();
    return path ? `${this.BASE_URL}${path}` : null;
  }

  /**
   * Récupère le profil complet de l'utilisateur connecté.
   * GET /api/auth/user/{id}
   */
  getProfile(): Observable<ProfileResponse> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    return this.http.get<ProfileResponse>(`${this.API_URL}/user/${userId}`).pipe(
      tap((res) => {
        if (res.success) {
          const stored = localStorage.getItem('user');
          const user = stored ? JSON.parse(stored) : {};
          user.photoUrl = res.photoUrl;
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  /**
   * Met à jour nom / téléphone / adresse.
   * PUT /api/auth/user/{id}/profile
   */
  updateProfile(request: UpdateProfileRequest): Observable<ProfileResponse> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    return this.http.put<ProfileResponse>(
      `${this.API_URL}/user/${userId}/profile`,
      request
    );
  }

  /**
   * Met à jour l'email de l'utilisateur connecté.
   * PUT /api/auth/user/{id}/email
   */
  updateEmail(email: string): Observable<AuthResponse> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    return this.http.put<AuthResponse>(
      `${this.API_URL}/user/${userId}/email`,
      { email }
    ).pipe(
      tap((res) => {
        if (res.success) {
          const stored = localStorage.getItem('user');
          const user = stored ? JSON.parse(stored) : {};
          user.email = res.email;
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  /**
   * Un utilisateur est considéré authentifié seulement s'il a ET un userId
   * ET un token JWT valide en local storage. C'est ce qui manquait avant :
   * on ne vérifiait que le userId, ce qui laissait passer des utilisateurs
   * fraîchement inscrits (sans token) vers les pages protégées, provoquant
   * des 403 sur tous les appels API.
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('userId') && !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('userId', String(res.userId));
    localStorage.setItem('user', JSON.stringify({ email: res.email, userId: res.userId }));
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
  }
}