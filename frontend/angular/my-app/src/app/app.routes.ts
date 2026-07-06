import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { MenuDevis } from './menu-devis/menu-devis';
import { AuthGuard } from './auth/core/guards/auth.guard';
import { NoAuthGuard } from './auth/core/guards/no-auth.guard';
import { ClientList } from './client-list/client-list';

export const routes: Routes = [
    // Redirect racine vers login
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },

    // Auth (pas de garde)
    {
        path: 'auth',
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            {
                path: 'login',
                loadComponent: () =>
                    import('./auth/login/login.component').then(m => m.LoginComponent),
                canActivate: [NoAuthGuard]
            },
            {
                path: 'forgot-password',
                loadComponent: () =>
                    import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
                canActivate: [NoAuthGuard]
            },
            {
                path: 'reset-password',
                loadComponent: () =>
                    import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
                canActivate: [NoAuthGuard]
            },
            // change-password nécessite d'être connecté
            {
                path: 'change-password',
                loadComponent: () =>
                    import('./auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
                canActivate: [AuthGuard]
            },
            // register
            {
                path: 'register',
                loadComponent: () =>
                    import('./auth/register/register.component').then(m => m.RegisterComponent),
                canActivate: [NoAuthGuard]
            }
        ]
    },

    // Pages protégées
    {
        path: 'accueil',
        loadComponent: () => import('./accueil/accueil').then(m => m.Accueil),
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'menu-devis',
        component: MenuDevis,
        canActivate: [AuthGuard]
    },
    {
        path: 'client-list',
        component: ClientList,
        canActivate: [AuthGuard]
    },
    {
        path: 'parametres',
        loadComponent: () => import('./topbar/parametre/parametres').then(m => m.Parametres),
        canActivate: [AuthGuard]
    }
];