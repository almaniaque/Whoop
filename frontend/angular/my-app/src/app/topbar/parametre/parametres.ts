import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, timestamp } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'; // Ajoute la modal
import { MatTabsModule } from '@angular/material/tabs'; // Gère les différents onglets
import { MatFormFieldModule } from '@angular/material/form-field'; // Gère les champs du formulaire
import { MatInput, MatInputModule } from '@angular/material/input'; // Gère les champs du formulaire
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Gère l'interrupteur on/off
import { MatSelectModule } from '@angular/material/select'; // Gère les listes déroulantes
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Liaison entre champs et données
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { AuthService } from '../../auth/core/services/auth.service';



@Component({
  selector: 'app-parametres',
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    FormsModule,
    ChangePasswordComponent,
    ReactiveFormsModule
  ],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css',
})
export class Parametres {

  profilForm: FormGroup;

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('profilName') profilName!: ElementRef<HTMLInputElement>;




  photoPreviewUrl: string | null = null;
  photoUploading = false;
  photoError: string | null = null;
  private originalEmail = '';

  preferences = {
    notifications: true,
    emailsResume: false,
    langue: 'fr',
    theme: 'clair'
  };

  // Permet de sauvegarder
  constructor(
    private dialogRef: MatDialogRef<Parametres>,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profilForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      nbSiret: [''],
      telephone: ['', [Validators.required]],
      adresse: [''],
      timestamp: ['']

    });

    this.chargerProfil();
  }


  private chargerProfil() {
    this.authService.getProfile().subscribe({
      next: (res) => {

        if (res.success) {
          this.originalEmail = res.email ?? '';
          this.profilForm.patchValue({
            nom: res.name ?? '',
            email: res.email ?? '',
            telephone: res.telephone ?? '',
            adresse: res.adresse ?? ''
          });
          this.photoPreviewUrl = res.photoUrl ? `${this.authService.getPhotoFullUrl()}` : this.photoPreviewUrl;

        }
      },
      error: (err) => {
        console.log(err);
        this.photoError = 'Impossible de charger le profil';
      }
    });
  }

  /** Déclenche l'ouverture du sélecteur de fichier caché */
  ouvrirSelecteurPhoto() {
    this.photoInput.nativeElement.click();
  }

  /** Appelé quand l'utilisateur choisit un fichier */
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.photoError = null;

    const extensionsAutorisees = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!extensionsAutorisees.includes(file.type)) {
      this.photoError = 'Format non supporté (jpg, png ou webp uniquement)';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.photoError = 'La photo ne doit pas dépasser 5 Mo';
      return;
    }

    // Aperçu immédiat avant même la réponse du serveur
    const reader = new FileReader();
    reader.onload = () => (this.photoPreviewUrl = reader.result as string);
    reader.readAsDataURL(file);

    this.photoUploading = true;
    this.authService.uploadPhoto(file).subscribe({
      next: (res) => {


        this.photoUploading = false;
        if (!res.success) {
          this.photoError = res.message;
        }


        this.photoPreviewUrl = res.photoUrl ? `${this.authService.getPhotoFullUrl()}` : this.photoPreviewUrl;



      },
      error: (err) => {

        this.photoUploading = false;
        this.photoError = "Erreur lors de l'envoi de la photo";
      }
    });

    // Réinitialise l'input pour pouvoir resélectionner le même fichier plus tard
    input.value = '';
  }

  sauvegarder() {
    if (this.profilForm.invalid) return;

    const { nom, telephone, adresse, email, nbSiret } = this.profilForm.getRawValue();

    const updateProfile$ = this.authService.updateProfile({ name: nom, nbSiret, telephone, adresse });
    const emailChanged = email !== this.originalEmail;
    const updateEmail$ = emailChanged ? this.authService.updateEmail(email) : of(null);

    forkJoin([updateProfile$, updateEmail$]).subscribe({
      next: ([profileRes, emailRes]) => {
        if (!profileRes.success) {
          this.photoError = profileRes.message;
          return;
        }
        if (emailRes && !emailRes.success) {
          this.photoError = emailRes.message;
          return;
        }
        this.dialogRef.close({
          profil: { ...profileRes, email: emailRes?.email ?? profileRes.email },
          preferences: this.preferences
        });
      },
      error: () => {
        this.photoError = 'Erreur lors de la sauvegarde du profil';
      }
    });
  }
}