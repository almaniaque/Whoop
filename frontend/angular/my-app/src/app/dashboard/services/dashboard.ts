import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DashboardStats } from '../models/dashboard-stats';


/**
 * Service d'accès à l'API du dashboard.
 *
 * Un seul appel : GET /api/dashboard/users/{userId}/dashboard
 * qui renvoie TOUTES les statistiques agrégées (voir DashboardStats).
 * Le userId et le token JWT sont ceux posés en localStorage par
 * AuthService au moment du login.
 */
@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);

    private apiUrl = `http://localhost:8080/api/dashboard/users/`;

    getStats() {
        let userId = localStorage.getItem('userId');
        let auth_token = localStorage.getItem("token");

        // Header Authorization obligatoire : la route est protégée côté
        // backend (Spring Security) — sans token valide, réponse 403.
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth_token}`
        })
        return this.http.get<DashboardStats>(`${this.apiUrl}${userId}/dashboard`, { headers: headers });
    }
}