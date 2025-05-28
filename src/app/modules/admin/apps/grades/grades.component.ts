import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgForOf } from '@angular/common';

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
}
