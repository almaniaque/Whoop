import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export interface LigneDevis {
  designation: string;
  qte: number;
  pu: number;
}

interface Devis {
  id: number;
  client: Client;
  categorie: string;
  date: string;
  echeance: string;
  statut: string;

}
interface Client {
  id: number;
  name: string;
  email: string;
  telephone: string;
  entreprise: string;
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
  selector: 'app-devis-form',
  standalone: true,
  templateUrl: './devis-form.html',
  styleUrl: './devis-form.css',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class DevisFormComponent implements OnChanges {

  @Input() devis: any = null;
  @Input() readOnly = false;
  @Output() fermer = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Devis>();
  @Input() user: AppUser | null = null;

  @ViewChild('content') content!: ElementRef;

  devisForm!: FormGroup;
  total=0;
  totalTVA = 0;
  totalTTC = 0;
  NbreJour = 0;



  constructor(private fb: FormBuilder) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devis'] && this.devis) {
      this.devisForm = this.fb.group({
        client: [this.devis.client ?? ''],
        categorie: [this.devis.categorie ?? ''],
        date: [this.devis.date ?? ''],
        echeance: [this.devis.echeance ?? ''],
      });
      this.calcul();
    }
  }


calcul(): void {
  const prestations = this.devis?.prestation || [];
  
  this.total = prestations.reduce(
    (somme: number, p: any) => somme + (p.quantite * p.montant), 
    0
  );
  
  this.totalTVA = this.total * 0.2;
  this.totalTTC = this.total + this.totalTVA;
}
  close(): void {
    this.fermer.emit();
  }

  onSubmit(): void {
    if (this.devisForm.invalid) return;
    const updated: Devis = {
      ...this.devis,
      ...this.devisForm.value,
      lignes: this.devisForm.value.lignes as LigneDevis[]
    };
    this.saved.emit(updated);
  }

  changerStatut(statut: Devis['statut']): void {
    this.saved.emit({ ...this.devis, statut });
  }

  imprimer(): void { window.print(); }

  async exportPdf() {
    const element = this.content.nativeElement;

    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    element.style.height = 'auto';
    element.style.overflow = 'visible';


    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
    .panel-body td, .panel-body th { padding: 15px 8px !important; }
    .panel-body tr { line-height: 2 !important; }
    .panel-body .section-client,
    .panel-body .section-top,
    .panel-body .totaux,
    .panel-body .section-footer { margin-bottom: 35px !important; }
    .panel-body .divider { margin: 35px 0 !important; }
  `;
    document.head.appendChild(styleTag);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let position = 0;
        let remainingHeight = pdfHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          remainingHeight -= pageHeight;
          position -= pageHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }
      pdf.save(`devis-${this.devis?.id}.pdf`);
    } finally {
      document.head.removeChild(styleTag);
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
    }
  }

}
