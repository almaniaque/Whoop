import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { DevisFormComponent } from './devis-form/devis-form';
import { NewDevisComponent } from './new-devis/new-devis';


interface Devis {
  id: number;
  client: Client;
  categorie: string;
  montant: number;
  date: string;
  echeance: string;
  statut: string;
  prestation: Prestation[];

}

interface Client {
  id: number;
  name: string;
  email: string;
  telephone: string;
  entreprise: string;
}

interface Prestation {
  id: number;
  intitule: string;
  quantite: number;
  montant: number;
}

interface AppUser {
  id: number;
  email: string;
  name: string;
  nbSiret: number;
  adresse: string;
  telephone: number;
}


@Component({
  selector: 'app-menu-devis',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, FormsModule, DevisFormComponent, NewDevisComponent],
  templateUrl: './menu-devis.html',
  styleUrl: './menu-devis.css',
})
export class MenuDevis implements OnInit {

  devisSelectionne: Devis | null = null;
  devisAModifier: any = null;

  dataSource: Devis[] = [];
  pagedData: Devis[] = [];
  pageSize = 8;
  currentPage = 0;
  searchTerm: string = '';
  allData: Devis[] = [];
  user:   AppUser | null = null;

  displayedColumns: string[] = ['id', 'client', 'categorie', 'montant', 'date', 'echeance', 'statut', 'devis'];

  trackBy = (index: number, item: Devis) => item.id;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.chargerDevis();
    this.chargerUser();

  }


  chargerUser(): void {
    const userId = localStorage.getItem('userId');
    const auth_token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });

    this.http.get<AppUser>(`http://localhost:8080/api/auth/user/${userId}`, { headers }).subscribe({
      next: (data) => { this.user = data; },
      error: (err) => console.error('Erreur chargement utilisateur', err)
    });
  }


  chargerDevis(): void {
    let userId = localStorage.getItem('userId');
    let auth_token = localStorage.getItem("token");

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });

    this.http.get<Devis[]>(`http://localhost:8080/api/devis/users/${userId}/devis`, { headers: headers }).subscribe({
      next: (data) => {
        this.allData = data;
        this.dataSource = data;
        this.updatePage();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement devis', err)
    });
  }

  newDevis(devis: any): void {
    this.chargerDevis();
  }

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    this.pagedData = this.dataSource.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  canEdit(statut: string): boolean {
    return statut === 'Refusé' || statut === 'En_attente';
  }

  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'Accepté': return 'fa-regular fa-circle-check';
      case 'Refusé': return 'fa-regular fa-circle-xmark';
      case 'En_attente': return 'fa-regular fa-clock';
      case 'En_cours': return 'fa-regular fa-clock';
      case 'Annulé': return 'fa-regular fa-ban';
      default: return '';
    }
  }

  formatStatut(statut: string): string {
    return statut.replace('_', ' ');
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.dataSource = this.allData.filter(d =>
      d.client?.name?.toLowerCase().includes(term) ||
      d.categorie?.toLowerCase().includes(term) ||
      d.statut?.toLowerCase().includes(term)
    );
    this.currentPage = 0;
    this.updatePage();
  }

  filtreActif: string = 'Tous';

  setFiltre(filtre: string): void {
    this.filtreActif = filtre;
    if (filtre === 'Tous') {
      this.dataSource = this.allData;
    } else {
      this.dataSource = this.allData.filter(d => d.statut === filtre);
    }
    this.currentPage = 0;
    this.updatePage();
  }

  voirDevis(devis: any): void {
    this.devisSelectionne = devis;
  }

  modifierDevis(devis: any): void {
    this.devisAModifier = devis;
    this.showNewDevisForm = true;
  }
  showNewDevisForm = false;

  ouvrirNouveauDevis(): void {
    this.showNewDevisForm = true;
  }

  fermerNouveauDevis(): void {
    this.showNewDevisForm = false;
    this.devisAModifier = null;
  }
}