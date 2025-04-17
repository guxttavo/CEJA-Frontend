import { TextFieldModule } from '@angular/cdk/text-field';
import {
    Component,
    Inject,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Turma } from '../turma.types';
import { TurmaService } from '../turma.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'turma-details',
    templateUrl: './turmaDetails.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        TextFieldModule,
        MatDialogModule,
        NgIf,
        NgClass
    ],
})
export class TurmaDetailsComponent implements OnInit {
    turma: Turma; 

    constructor(
        private _matDialogRef: MatDialogRef<TurmaDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _turmaService: TurmaService
    ) {}

    ngOnInit(): void {
        this.turma = {
            year: null,
            shift: null,
            suffix: ''
        };
    }

    createTurma(): void {
        this._turmaService.createTurma(this.turma).subscribe({
            next: () => this._matDialogRef.close(),
            error: (err) => console.error('Erro ao criar turma:', err)
        });
    }

    getShiftName(shift: number): string {
        switch (shift) {
            case 1:
                return 'Manhã';
            case 2:
                return 'Tarde';
            case 3:
                return 'Noite';
            default:
                return '';
        }
    }
    
}
