import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgForOf } from '@angular/common';

// 📦 importações para gerar PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './grades.component.html'
})
export class GradesComponent {
  displayedColumns: string[] = ['disciplina', 'valor'];

  constructor(
    public dialogRef: MatDialogRef<GradesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, notas: { disciplina: string, valor: number }[] }
  ) {}

  gerarCertificado(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Certificado de Notas', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Aluno(a): ${this.data.name}`, 20, 35);

    autoTable(doc, {
      head: [['Disciplina', 'Nota']],
      body: this.data.notas.map(nota => [nota.disciplina, nota.valor.toString()]),
      startY: 45,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;
    doc.text('_________________________________', 20, finalY + 30);
    doc.text('Assinatura da Coordenação', 20, finalY + 38);
    
    const nomeArquivo = `certificado_${this.data.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(nomeArquivo);
  }
}
