import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const LABEL_MAINTENANCE = 'Maintenance corrective (Support technique, corrections de bugs, garantie post-livraison)';

@Component({
  selector: 'app-new-devis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-devis.html',
  styleUrls: ['./new-devis.css']
})
export class NewDevisComponent implements OnInit {

  form!: FormGroup;
  messageValidation: string = '';
  clients: any[] = [];

  @Input() devisExistant: any = null;
  @Input() user: any = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() devisCree = new EventEmitter<any>();
  prestationsDisponibles: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  get modeEdition(): boolean {
    return !!this.devisExistant;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      adresse: [''],
      siret: [''],
      email: ['', Validators.email],
      sourceClient: ['existant'],
      clientId: [''],
      nomClient: [''],
      categorie: ['', Validators.required],
      dateDebut: ['', Validators.required],
      echeance: ['', Validators.required],
      maintenanceCorrective: [false],
      lignes: this.fb.array([this.creerLigne()])
    });

    this.appliquerValidationClient();
    this.chargerClients();
    this.chargerPrestations();

    if (this.user) {
      this.form.patchValue({
        nom: this.user.name,
        adresse: this.user.adresse,
        siret: this.user.nbSiret,
        email: this.user.email
      });
    }

    if (this.modeEdition) {
      this.remplirFormulaire(this.devisExistant);
    }
  }

  private formatDateInput(date: string): string {
    if (!date) return '';
    return date.split('T')[0];
  }

  private remplirFormulaire(devis: any): void {
    const prestationsBrutes = devis.prestation || [];
    const prestationsSansMaintenance = prestationsBrutes.filter((p: any) => p.intitule !== LABEL_MAINTENANCE);

    this.lignes.clear();

    prestationsSansMaintenance.forEach((p: any) => {
      this.lignes.push(this.fb.group({
        source: ['nouvelle'],
        prestationId: [''],
        intitule: [p.intitule],
        quantite: [p.quantite],
        montant: [p.montant]
      }));
    });

    if (this.lignes.length === 0) {
      this.lignes.push(this.creerLigne());
    }

    this.form.patchValue({
      sourceClient: 'existant',
      clientId: devis.client?.id ?? '',
      categorie: devis.categorie,
      dateDebut: this.formatDateInput(devis.date),
      echeance: this.formatDateInput(devis.echeance),
    });
  }

  private appliquerValidationClient(): void {
    const clientIdCtrl = this.form.get('clientId')!;
    const nomClientCtrl = this.form.get('nomClient')!;

    this.form.get('sourceClient')!.valueChanges.subscribe((source: string) => {
      if (source === 'existant') {
        clientIdCtrl.setValidators([Validators.required]);
        nomClientCtrl.clearValidators();
        nomClientCtrl.setValue('');
      } else {
        nomClientCtrl.setValidators([Validators.required]);
        clientIdCtrl.clearValidators();
        clientIdCtrl.setValue('');
      }
      clientIdCtrl.updateValueAndValidity();
      nomClientCtrl.updateValueAndValidity();
    });

    clientIdCtrl.setValidators([Validators.required]);
    clientIdCtrl.updateValueAndValidity();
  }

  changerSourceClient(source: 'existant' | 'nouveau'): void {
    this.form.get('sourceClient')!.setValue(source);
  }

  choisirMaintenance(valeur: boolean): void {
    this.form.get('maintenanceCorrective')!.setValue(valeur);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  chargerClients(): void {
    const userId = localStorage.getItem('userId');
    this.http.get<any[]>(`http://localhost:8080/api/clients/users/${userId}/clients`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.clients = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Erreur chargement clients', err)
      });
  }

  chargerPrestations(): void {
    this.http.get<any[]>(`http://localhost:8080/api/prestations`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.prestationsDisponibles = data; this.cdr.detectChanges(); },
        error: (err) => console.error('Erreur chargement prestations', err)
      });
  }

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  creerLigne(): FormGroup {
    return this.fb.group({
      source: ['nouvelle'],
      prestationId: [''],
      intitule: [''],
      quantite: [1],
      montant: [0]
    });
  }

  ajouterLigne(): void {
    this.lignes.push(this.creerLigne());
  }

  supprimerLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  validerDevis(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = localStorage.getItem('userId');
    const formValue = this.form.value;

    this.mettreAJourUser(userId, formValue).subscribe({
      next: () => this.mettreAJourEmail(userId, formValue),
      error: (err) => console.error('Erreur mise à jour profil', err)
    });

    this.poursuivreValidationDevis(userId, formValue);
  }

  private mettreAJourUser(userId: string | null, formValue: any): Observable<any> {
    const payload = {
      name: formValue.nom,
      adresse: formValue.adresse,
      nbSiret: formValue.siret
    };
    return this.http.put<any>(
      `http://localhost:8080/api/auth/user/${userId}/profile`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  private mettreAJourEmail(userId: string | null, formValue: any): void {
    this.http.put<any>(
      `http://localhost:8080/api/auth/user/${userId}/email`,
      { email: formValue.email },
      { headers: this.getHeaders() }
    ).subscribe({
      error: (err) => console.error('Erreur mise à jour email', err)
    });
  }

  private poursuivreValidationDevis(userId: string | null, formValue: any): void {
    if (this.modeEdition) {
      const clientId = formValue.clientId || this.devisExistant.client?.id;
      this.modifierDevisExistant(userId, clientId, formValue);
      return;
    }

    if (formValue.sourceClient === 'existant') {
      this.creerDevis(userId, formValue.clientId, formValue);
    } else {
      const nouveauClient = { name: formValue.nomClient };

      this.http.post<any>(
        `http://localhost:8080/api/clients/users/${userId}/clients`,
        nouveauClient,
        { headers: this.getHeaders() }
      ).subscribe({
        next: (clientCree) => {
          this.creerDevis(userId, clientCree.id, formValue);
        },
        error: (err) => {
          console.error('Erreur création client', err);
          this.messageValidation = 'Erreur lors de la création du client';
        }
      });
    }
  }

  private construirePrestations(formValue: any): any[] {
    const prestations = formValue.lignes.map((l: any) => ({
      intitule: l.intitule,
      quantite: l.quantite,
      montant: l.montant
    }));

    if (formValue.maintenanceCorrective) {
      prestations.push({
        intitule: LABEL_MAINTENANCE,
        quantite: 3,
        montant: 1200
      });
    }

    return prestations;
  }

  private creerDevis(userId: string | null, clientId: number | string, formValue: any): void {
    const today = new Date();
    const echeance = new Date();
    echeance.setDate(today.getDate() + 30);

    const payload = {
      date: today.toISOString().split('T')[0],
      echeance: echeance.toISOString().split('T')[0],
      categorie: formValue.categorie,
      statut: 'En_attente',
      prestation: this.construirePrestations(formValue)
    };

    this.http.post<any>(
      `http://localhost:8080/api/devis/users/${userId}/clients/${clientId}/devis`,
      payload,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (devisCree) => {
        this.messageValidation = 'Demande enregistrée';
        this.devisCree.emit(devisCree);
        setTimeout(() => {
          this.messageValidation = '';
          this.fermer.emit();
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création devis', err);
        this.messageValidation = 'Erreur lors de la création du devis';
      }
    });
  }
private modifierDevisExistant(userId: string | null, clientId: number | string, formValue: any): void {
  const payload = {
    date: formValue.dateDebut,
    echeance: formValue.echeance,
    categorie: formValue.categorie,
    statut: this.devisExistant.statut,
    prestation: this.construirePrestations(formValue)
  };

  this.http.put<any>(
    `http://localhost:8080/api/devis/${this.devisExistant.id}`,
    payload,
    { headers: this.getHeaders() }
  ).subscribe({
    next: (devisModifie) => {
      this.messageValidation = 'Devis modifié avec succès';
      this.devisCree.emit(devisModifie);
      setTimeout(() => {
        this.messageValidation = '';
        this.fermer.emit();
      }, 1500);
    },
    error: (err) => {
      console.error('Erreur modification devis', err);
      this.messageValidation = 'Erreur lors de la modification du devis';
    }
  });
}

  changerSource(index: number, source: 'existante' | 'nouvelle'): void {
    const ligne = this.lignes.at(index);
    ligne.patchValue({
      source,
      prestationId: '',
      intitule: ''
    });
  }

  selectionnerPrestation(index: number, prestationId: string): void {
    const prestation = this.prestationsDisponibles.find(p => p.idPrestation == prestationId);
    if (prestation) {
      const ligne = this.lignes.at(index);
      ligne.patchValue({
        prestationId,
        intitule: prestation.intitule,
        montant: prestation.montant
      });
    }
  }
}