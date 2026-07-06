import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Devis, Client } from '../client-list';

@Component({
  selector: 'app-devis-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './devis-dialog.html',
  styleUrl: './devis-dialog.css'
})
export class DevisDialog {
  constructor(
    public dialogRef: MatDialogRef<DevisDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { client: Client; devis: Devis[] }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}