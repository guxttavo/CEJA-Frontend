import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgForOf } from '@angular/common';

@Component({
    selector: 'notas-dialog',
    standalone: true,
    template: `
    <h2 mat-dialog-title>Notas de {{ data.name }}</h2>
    <mat-dialog-content>
        <table mat-table [dataSource]="data.notas" class="w-full mat-elevation-z8">
            <ng-container matColumnDef="disciplina">
                <th mat-header-cell *matHeaderCellDef> Disciplina </th>
                <td mat-cell *matCellDef="let nota"> {{ nota.disciplina }} </td>
            </ng-container>

            <ng-container matColumnDef="valor">
                <th mat-header-cell *matHeaderCellDef> Nota </th>
                <td mat-cell *matCellDef="let nota"> {{ nota.valor }} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
    `,
    styles: [`
        table {
            width: 100%;
        }
    `],
    imports: [
        MatDialogModule,
        MatTableModule,
        NgIf,
        NgForOf
    ]
})
export class NotasDialogComponent {
    displayedColumns: string[] = ['disciplina', 'valor'];

    constructor(
        public dialogRef: MatDialogRef<NotasDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { name: string, notas: { disciplina: string, valor: number }[] }
    ) { }
}
