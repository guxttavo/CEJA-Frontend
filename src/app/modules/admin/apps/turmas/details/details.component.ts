import { CdkScrollable } from '@angular/cdk/scrolling';
import { CommonModule, DOCUMENT, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TurmasService } from 'app/modules/admin/apps/turmas/turmas.service';
import { Turma } from 'app/modules/admin/apps/shared/turmas.types';
import { Aluno } from 'app/modules/admin/apps/shared/alunos.types';
import { Subject, takeUntil } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AlunosService } from '../../alunos/alunos.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
    selector: 'turmas-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterLink,
        MatIconModule,
        NgClass,
        MatButtonModule,
        MatProgressBarModule,
        CdkScrollable,
        MatTabsModule,
        FuseFindByKeyPipe,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        CommonModule,
        MatAutocompleteModule
    ],
})
export class TurmasDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('turmaSteps', { static: true }) turmaSteps: MatTabGroup;
    turma: Turma;
    currentStep: number = 0;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    newStudentId: number;
    addStudentError: string = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    studentCounts: Map<number, number> = new Map();
    students: Aluno[] = [];
    filteredStudents: Aluno[] = [];
    selectedStudentId: number | null = null;
    selectedStudentName: string = '';
    isAddingStudent = false;

    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _turmasService: TurmasService,
        private _alunosService: AlunosService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const id = location.pathname.split('/').pop();
        this._turmasService.getTurmaComAlunos(id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((turma) => {
                this.turma = turma;
                this._changeDetectorRef.markForCheck();
            });

        this._turmasService.getStudentCountByClassId(Number(id)).subscribe(count => {
            this.studentCounts.set(Number(id), count);
            this._changeDetectorRef.markForCheck();
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
                this.drawerOpened = matchingAliases.includes('lg');
                this._changeDetectorRef.markForCheck();
            });

        this.loadAllStudents();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    goToStep(step: number): void {
        this.currentStep = step;
        this.turmaSteps.selectedIndex = this.currentStep;
        this._changeDetectorRef.markForCheck();
    }

    goToPreviousStep(): void {
        if (this.currentStep === 0) return;
        this.goToStep(this.currentStep - 1);
    }

    goToNextStep(): void {
        this.goToStep(this.currentStep + 1);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    loadAllStudents(): void {
        this._alunosService.getAllStudents().subscribe((students) => {
            this.students = students;
        });
    }

    filterStudents(query: string): void {
        if (!query || query.length < 2) {
            this.filteredStudents = [];
            return;
        }
    
        this._alunosService.getAllStudents().subscribe({
            next: (students) => {
                this.filteredStudents = students.filter(s =>
                    s.name.toLowerCase().includes(query.toLowerCase()) ||
                    s.email?.toLowerCase().includes(query.toLowerCase())
                );
            },
            error: () => {
                this.filteredStudents = [];
            }
        });
    }
    

    onStudentSelected(selectedName: string): void {
        const found = this.filteredStudents.find(s => s.name === selectedName);
        this.selectedStudentId = found?.id || null;
    }
    

    addStudentToClass(): void {
        if (!this.selectedStudentId || !this.turma?.id) return;

        this._turmasService.addStudentToClass(this.turma.id, this.selectedStudentId).subscribe({
            next: () => {
                this.addStudentError = '';
                this.selectedStudentId = null;
                this.selectedStudentName = '';
                this.loadTurma();
            },
            error: () => {
                this.addStudentError = 'Erro ao adicionar aluno à turma.';
            }
        });
    }

    loadTurma(): void {
        const id = this._activatedRoute.snapshot.paramMap.get('id');
        if (!id) return;
    
        this._turmasService.getTurmaComAlunos(id).subscribe({
            next: (turma) => {
                this.turma = turma;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                console.error('Erro ao carregar dados da turma');
            }
        });
    }
    cancelAddStudent(): void {
        this.isAddingStudent = false;
        this.selectedStudentName = '';
        this.selectedStudentId = null;
        this.filteredStudents = [];
        this.addStudentError = '';
    }
    
}