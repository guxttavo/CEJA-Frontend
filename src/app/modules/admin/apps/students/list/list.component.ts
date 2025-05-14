import { AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass, NgIf, NgForOf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { StudentsService } from 'app/modules/admin/apps/students/students.service';
import { Student } from 'app/modules/admin/apps/shared/student.types';
import { Observable, Subject, filter, fromEvent, takeUntil } from 'rxjs';
import { TurmaService } from '../../turmas/turma.service';
import { Turma } from '../../shared/turma.types';

@Component({
    selector: 'alunos-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        RouterOutlet,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        NgClass,
        RouterLink,
        AsyncPipe,
        I18nPluralPipe,
        MatSelectModule,
        MatSlideToggleModule,
        NgIf,
        NgForOf
    ],
})
export class AlunosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    alunos$: Observable<Student[]>;
    turmas: Turma[] = [];
    alunos: Student[] = [];
    allAlunos: Student[] = [];

    selectedFilter: 'all' | 'turma' = 'all';
    selectedTurmaFilter: 'year' | 'shift' | 'suffix' | 'educationLevel' | null = null;
    selectedTurmaShift: number | null = null;
    anosDisponiveis: number[] = [];
    periodosDisponiveis = [
        { label: 'Manhã', value: 1 },
        { label: 'Tarde', value: 2 },
        { label: 'Noite', value: 3 }
    ];
    sufixosDisponiveis: string[] = [];
    selectedTurmaSuffix: string | null = null;

    alunosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedAluno: Student;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _turmaService: TurmaService,
        private _studentsService: StudentsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) { }

    ngOnInit(): void {
        this.alunos$ = this._studentsService.alunos$;

        this._studentsService.getAllStudents().subscribe((alunos) => {
            this.allAlunos = alunos;
            this._studentsService.setAlunos(alunos);
        });

        this.alunos$.pipe(takeUntil(this._unsubscribeAll)).subscribe((alunos) => {
            this.alunos = alunos;
            this.alunosCount = alunos?.length || 0;
            this._changeDetectorRef.markForCheck();
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
                this._changeDetectorRef.markForCheck();
            });

        // fromEvent(this._document, 'keydown')
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         filter<KeyboardEvent>(
        //             (event) => (event.ctrlKey === true || event.metaKey) && event.key === '/'
        //         )
        //     )
        //     .subscribe(() => {
        //         this.createAluno();
        //     });

        this.searchInputControl.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((searchText: string) => {
                const termo = searchText?.toLowerCase() ?? '';

                const resultados = this.allAlunos.filter((aluno) =>
                    aluno.name.toLowerCase().includes(termo) ||
                    aluno.document?.toLowerCase().includes(termo)
                );

                this._studentsService.setAlunos(resultados);
                this._changeDetectorRef.markForCheck();
            });
    }

    // createAluno(): void {
    //     const newAluno: Student = {
    //         id: 0,
    //         name: 'Novo Aluno',
    //         email: '',
    //         phone: '',
    //         document: '',
    //         password: '',
    //         bornDate: new Date().toISOString(),
    //         RegistrationNumber: 0
    //     };

    //     this._studentsService.createAluno(newAluno).subscribe((created) => {
    //         this._router.navigate(['./', created.id], { relativeTo: this._activatedRoute });
    //         this._changeDetectorRef.markForCheck();
    //     });
    // }

    // onFilterChange(value: 'all' | 'turma'): void {
    //     if (value === 'all') {
    //         this._studentsService.getAllStudents().subscribe((alunos) => {
    //             this.allAlunos = alunos;
    //             this._studentsService.setAlunos(alunos);
    //         });
    //     }

    //     if (value === 'turma') {
    //         this._studentsService.getAllStudentsWithClass().subscribe((alunosComTurma) => {
    //             this.allAlunos = alunosComTurma;
    //             this._studentsService.setAlunos(alunosComTurma);
    //             this.getYearFromStudent(alunosComTurma);
    //         });
    //     }
    // }

    // onTurmaFilterChange(): void {
    //     if (this.selectedTurmaFilter === 'year' && this.alunos?.length) {
    //         this.getYearFromStudent(this.alunos);
    //     }

    //     if (this.selectedTurmaFilter === 'suffix') {
    //         this.getSuffixFromStudent(this.alunos);
    //         this.selectedTurmaSuffix = null;
    //     }
    // }

    // getYearFromStudent(alunos: Student[]): void {
    //     const anos = alunos.map(a => a.class?.year).filter(Boolean);
    //     this.anosDisponiveis = [...new Set(anos)].sort((a, b) => a - b);
    // }

    // getSuffixFromStudent(alunos: Student[]): void {
    //     const sufixos = alunos.map(a => a.class?.suffix).filter(Boolean);
    //     this.sufixosDisponiveis = [...new Set(sufixos)].sort();
    // }

    // onTurmaYearSelected(year: number): void {
    //     const alunosFiltrados = this.allAlunos.filter(a => a.class?.year === year);
    //     this._studentsService.setAlunos(alunosFiltrados);
    //     this._changeDetectorRef.markForCheck();
    // }

    // onTurmaShiftSelected(shiftSelecionado: number): void {
    //     if (!shiftSelecionado) return;
    //     const alunosFiltrados = this.allAlunos.filter(a => a.class?.shift === shiftSelecionado);
    //     this._studentsService.setAlunos(alunosFiltrados);
    //     this._changeDetectorRef.markForCheck();
    // }

    // onTurmaSuffixSelected(suffixSelecionado: string): void {
    //     if (!suffixSelecionado) return;
    //     const alunosFiltrados = this.allAlunos.filter(a => a.class?.suffix === suffixSelecionado);
    //     this._studentsService.setAlunos(alunosFiltrados);
    //     this._changeDetectorRef.markForCheck();
    // }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
