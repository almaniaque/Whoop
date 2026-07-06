import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../auth/core/services/auth.service';
import { Parametres } from './parametre/parametres';



@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, MatMenuModule, MatDialogModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  isOpen = signal(true);
  currentPage = signal('');
  currentPageInfo = signal('');
  private router = inject(Router);

  private pageLabels: Record<string, string> = {
    '/accueil': 'Accueil',
    '/dashboard': 'Dashboard',
    '/menu-devis': 'gestion des devis',
    '/clients': 'Portefeuille clients',
    '/parametres': 'Paramètres',
  };

  private infoLabels: Record<string, string> = {
    '/accueil': 'Bienvenue sur WhoopStack',
    '/dashboard': 'Synthèse - Juin 2026',
    '/menu-devis': 'Créez, suivez et gérez vos devis',
    '/clients': 'Gérez votre portefeuille clients',
    '/parametres': 'Configurez votre espace de travail',
  }


  constructor(private authService: AuthService, private dialog: MatDialog) {
    // Lit l'URL déjà active dès la création du composant
    const initialUrl = this.router.url.split('?')[0];
    this.currentPage.set(this.pageLabels[initialUrl] ?? '');
    this.currentPageInfo.set(this.infoLabels[initialUrl] ?? '');

    // Puis continue à écouter les navigations suivantes
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const url = e.urlAfterRedirects.split('?')[0];

        this.currentPage.set(this.pageLabels[url] ?? '');
        this.currentPageInfo.set(this.infoLabels[url] ?? '');
      });
  }
  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  close() {
    this.isOpen.set(false);
  }

  ouvrirParametres() {
    const dialogRef = this.dialog.open(Parametres, {
      width: '560px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(resultat => {
      if (resultat) {
        console.log('Profil sauvegardé :', resultat.profil);
        console.log('Préférences sauvegardées :', resultat.preferences);
      }
    });
  }
  logout() {
    this.authService.logout();
  }

}