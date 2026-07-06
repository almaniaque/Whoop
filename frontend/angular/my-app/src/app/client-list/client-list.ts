import { ChangeDetectorRef, OnInit, Component, ViewChild, signal, inject } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DevisDialog } from './devis-dialog/devis-dialog';
import { ClientFormDialog, ClientFormDialogData } from './client-form/client-form';

export interface Client {
  id: number;
  name: string;
  email: string;
  telephone: string;
  entreprise: string;
  ville: string;
}

export interface Devis {
  id: number;
  categorie: string;
  date: string;
  echeance: string;
  montant: number;
  statut: string;
  client_id: number;
  user_id: number;
}

@Component({
  selector: 'app-client-list',
  styleUrl: './client-list.css',
  templateUrl: './client-list.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatTabGroup,
    MatButtonModule,
    MatSnackBarModule
  ],
})
export class ClientList implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  clients: Client[] = [];
  pagedData: Client[] = [];
  pageSize = 8;
  currentPage = 0;
  searchTerm = '';
  allData: Client[] = [];

  displayedColumns: string[] = ['entreprise', 'name', 'telephone', 'email', 'ville'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  dataSource!: MatTableDataSource<Client>;
  expandedElement: Client | null = null;

  devisByClient = new Map<number, Devis[]>();
  loadingDevisClientIds = new Set<number>();

  hideSingleSelectionIndicator = signal(false);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  trackBy = (index: number, item: Client) => item.id;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    const auth_token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });

    this.http.get<Client[]>(
      `http://localhost:8080/api/clients/users/${userId}/clients`,
      { headers: headers }
    ).subscribe({
      next: (data) => {
        this.allData = data;
        this.clients = data;

        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement clients', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.clients = this.dataSource.filteredData;
  }

  toggleSingleSelectionIndicator(): void {
    this.hideSingleSelectionIndicator.update(value => !value);
  }

  isExpanded(element: Client): boolean {
    return this.expandedElement === element;
  }

  toggle(element: Client): void {
    if (this.isExpanded(element)) {
      this.expandedElement = null;
      return;
    }

    if (this.devisByClient.has(element.id)) {
      this.expandedElement = element;
      this.cdr.detectChanges();
      return;
    }

    this.loadDevisForClient(element, true);
  }

  getDevisForClient(client: Client): Devis[] {
    return this.devisByClient.get(client.id) || [];
  }

  isLoadingDevis(client: Client): boolean {
    return this.loadingDevisClientIds.has(client.id);
  }

  loadDevisForClient(client: Client, expandAfterLoad: boolean = false): void {
    const userId = localStorage.getItem('userId');
    const auth_token = localStorage.getItem('token');

    if (this.loadingDevisClientIds.has(client.id)) {
      return;
    }

    this.loadingDevisClientIds.add(client.id);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${auth_token}`
    });

    this.http.get<Devis[]>(
      `http://localhost:8080/api/devis/users/${userId}/clients/${client.id}/devis`,
      { headers: headers }
    ).subscribe({
      next: (data) => {
        const newMap = new Map(this.devisByClient);
        newMap.set(client.id, data);
        this.devisByClient = newMap;

        if (expandAfterLoad) {
          this.expandedElement = client;
        }

        this.loadingDevisClientIds.delete(client.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement devis', err);
        this.loadingDevisClientIds.delete(client.id);
        this.cdr.detectChanges();
      }
    });
  }

  openClientDialog(mode: 'create' | 'edit', client?: Client): void {
    const dialogRef = this.dialog.open(ClientFormDialog, {
      width: '450px',
      data: { mode, client } as ClientFormDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'create') {
        this.allData = [...this.allData, result.client];
        this.showSnackbar('Client ajouté avec succès');
      } else if (result.action === 'update') {
        this.allData = this.allData.map(c =>
          c.id === result.client.id ? result.client : c
        );
        this.showSnackbar('Client modifié avec succès');
      } else if (result.action === 'delete') {
        this.allData = this.allData.filter(c =>
          c.id !== result.client.id
        );
        this.showSnackbar('Client supprimé avec succès');
      }

      this.dataSource.data = this.allData;
      this.clients = this.dataSource.filteredData;
      this.cdr.detectChanges();
    });
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  private showDialog(client: Client, devis: Devis[]): void {
    console.log('Ouverture de la modale', client, devis);

    this.dialog.open(DevisDialog, {
      width: '600px',
      data: { client, devis }
    });
  }

  openDevisDialog(client: Client): void {
    if (this.devisByClient.has(client.id)) {
      this.showDialog(client, this.devisByClient.get(client.id)!);
      return;
    }

    const userId = localStorage.getItem('userId');
    const auth_token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${auth_token}`
    });

    this.http.get<Devis[]>(
      `http://localhost:8080/api/devis/users/${userId}/clients/${client.id}/devis`,
      { headers: headers }
    ).subscribe({
      next: (data) => {
        const newMap = new Map(this.devisByClient);
        newMap.set(client.id, data);
        this.devisByClient = newMap;

        this.showDialog(client, data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement devis', err);
        this.cdr.detectChanges();
      }
    });
  }
}