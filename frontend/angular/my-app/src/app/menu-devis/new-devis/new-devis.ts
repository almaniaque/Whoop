import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  @Output() fermer = new EventEmitter<void>();
  @Output() devisCree = new EventEmitter<any>();
  prestationsDisponibles: any[] = [];
  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) { }
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
      lignes: this.fb.array([
        this.creerLigne()
      ])
    });

    this.appliquerValidationClient();
    this.chargerClients();
    this.chargerPrestations();
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

    if (formValue.sourceClient === 'existant') {
      this.creerDevis(userId, formValue.clientId, formValue);
    } else {
   
      const nouveauClient = {
        name: formValue.nomClient
      
      };

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

private creerDevis(userId: string | null, clientId: number | string, formValue: any): void {
  const today = new Date();
  const echeance = new Date();
  echeance.setDate(today.getDate() + 30);

  const payload = {
    date: today.toISOString().split('T')[0],
    echeance: echeance.toISOString().split('T')[0],
    categorie: formValue.categorie,
    statut: 'En_attente',
    prestation: formValue.lignes.map((l: any) => ({
      intitule: l.intitule,
      quantite: l.quantite,
      montant: l.montant
    }))
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