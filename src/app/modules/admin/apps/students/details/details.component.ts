import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { NotaService } from '../notas/notas.service';
import { MatDialog } from '@angular/material/dialog';
import { NotasDialogComponent } from '../notas/notas.component'; 
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { DatePipe, NgClass, NgIf, NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { StudentsService } from '../students.service';
import { Student } from '../../shared/student.types';
import { AlunosListComponent } from '../list/list.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
    selector: 'alunos-details',
    templateUrl: './details.component.html',
    standalone: true,
    imports: [
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        NgClass,
        NgIf,
        NgForOf,
        DatePipe,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlunosDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;

    aluno: Student;
    alunoForm: UntypedFormGroup;
    editMode = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _alunosListComponent: AlunosListComponent,
        private _studentsService: StudentsService,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _dialog: MatDialog,
        private _notaService: NotaService
    ) { }

    ngOnInit(): void {
        this._alunosListComponent.matDrawer.open();

        this.alunoForm = this._formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            email: ['', Validators.required],
            phone: [''],
            document: [''],
            bornDate: [''],
            registrationNumber: [''],
            address: [''],
            password: [''],
            tags: [[]],
        });

        this._studentsService.aluno$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((aluno: Student) => {
                if (!aluno) return;

                this.aluno = aluno;
                this.alunoForm.patchValue(aluno);
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._alunosListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        this.editMode = editMode === null ? !this.editMode : editMode;
        this._changeDetectorRef.markForCheck();
    }

    updateAluno(): void {
        const aluno = this.alunoForm.getRawValue();
    
        this._studentsService.updateAluno(aluno.id, aluno).subscribe(() => {
            this._studentsService.getAlunoById(aluno.id).subscribe(() => {
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });
        });
    }
    
    verNotas(): void {
        this._notaService.getGradeStudent(this.aluno.id).subscribe((notas) => {
            this._dialog.open(NotasDialogComponent, {
                width: '500px',
                data: {
                    name: this.aluno.name,
                    notas: notas
                }
            });
        });
    }
    
    deleteAluno(): void {
        const id = this.aluno.id;
        this._studentsService.deleteAluno(id).subscribe(() => {
            this.closeDrawer().then(() => {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            });
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
