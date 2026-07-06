import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client } from '../client-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


export interface ClientFormDialogData {
  mode: 'create' | 'edit';
  client?: Client;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css'
})
export class ClientFormDialog {
  form: FormGroup;
  isEditMode: boolean;
  confirmingDelete = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ClientFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ClientFormDialogData
  ) {
    this.isEditMode = data.mode === 'edit';

    this.form = this.fb.group({
      name: [data.client?.name ?? '', Validators.required],
      email: [data.client?.email ?? '', [Validators.required, Validators.email]],
      telephone: [data.client?.telephone ?? '', Validators.required],
      entreprise: [data.client?.entreprise ?? '', Validators.required],
      ville: [data.client?.ville ?? '', Validators.required],
    });
  }

  private getHeaders(): HttpHeaders {
    const auth_token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth_token}`
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    const headers = this.getHeaders();

    if (this.isEditMode && this.data.client) {
      this.http.put<Client>(`http://localhost:8080/api/clients/${this.data.client.id}`, payload, { headers })
        .subscribe({
          next: (updated) => this.dialogRef.close({ action: 'update', client: updated }),
          error: (err) => {
            console.error('Erreur modification client', err);
            this.snackBar.open('Erreur lors de la modification du client', 'Fermer', { duration: 3000 });
          }
        });
    } else {
      const userId = localStorage.getItem('userId');
      this.http.post<Client>(`http://localhost:8080/api/clients/users/${userId}/clients`, payload, { headers })
        .subscribe({
          next: (created) => this.dialogRef.close({ action: 'create', client: created }),
          error: (err) => {
            console.error('Erreur création client', err);
            this.snackBar.open('Erreur lors de la création du client', 'Fermer', { duration: 3000 });
          }
        });
    }
  }

  askDelete(): void {
    this.confirmingDelete = true;
  }

  cancelDelete(): void {
    this.confirmingDelete = false;
  }

  confirmDelete(): void {
    if (!this.data.client) return;
    const headers = this.getHeaders();
    this.http.delete(`http://localhost:8080/api/clients/${this.data.client.id}`, { headers })
      .subscribe({
        next: () => this.dialogRef.close({ action: 'delete', client: this.data.client }),
        error: (err) => {
          console.error('Erreur suppression client', err);
          this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}