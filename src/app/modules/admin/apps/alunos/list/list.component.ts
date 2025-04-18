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
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AlunosService } from 'app/modules/admin/apps/alunos/alunos.service';
import {
    Aluno,
} from 'app/modules/admin/apps/alunos/alunos.types';
import {
    Observable,
    Subject,
    filter,
    fromEvent,
    switchMap,
    takeUntil,
} from 'rxjs';
import { TurmaService } from '../../turmas/turma.service';
import { Turma } from '../../turmas/turma.types';

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

    alunos$: Observable<Aluno[]>;
    turmas: Turma[];
    alunos: Aluno[];
    // variaveis referentes ao dropdown de turma e seus respectivos sub-dropdowns
    selectedFilter: 'all' | 'turma' = 'all';
    selectedTurmaFilter: 'year' | 'shift' | 'suffix' | 'educationLevel' | null = null;
    selectedTurmaId: number | null = null;
    anosDisponiveis: number[] = [];

    alunosCount: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedAluno: Aluno;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _turmaService: TurmaService,
        private _alunosService: AlunosService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) { }

    ngOnInit(): void {
        this.alunos$ = this._alunosService.alunos$;

        this._alunosService.getAllStudents().subscribe();

        this.alunos$.pipe(takeUntil(this._unsubscribeAll)).subscribe((alunos) => {
            this.alunosCount = alunos?.length || 0;
            this._changeDetectorRef.markForCheck();
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(
                    (event) =>
                        (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
                        event.key === '/' // '/'
                )
            )
            .subscribe(() => {
                this.createAluno();
            });
    }

    createAluno(): void {
        this._alunosService.createAluno().subscribe((newAluno) => {
            this._router.navigate(['./', newAluno.id], {
                relativeTo: this._activatedRoute,
            });

            this._changeDetectorRef.markForCheck();
        });
    }

    onFilterChange(value: 'all' | 'turma'): void {
        if (value === 'all') {
            this._alunosService.getAllStudents().subscribe();
            this.selectedTurmaId = null;
        } else if (value === 'turma') {
            this._alunosService.getAllStudentsWithClass().subscribe((alunos) => {
                this.alunos = alunos;
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    onTurmaFilterChange(): void {
        if (this.selectedTurmaFilter === 'year' && this.turmas?.length) {
            this.anosDisponiveis = [...new Set(this.turmas.map(t => t.year))].sort((a, b) => a - b);
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
