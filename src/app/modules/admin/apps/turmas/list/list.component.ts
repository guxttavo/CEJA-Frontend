import { CdkScrollable } from '@angular/cdk/scrolling';
import { DOCUMENT, I18nPluralPipe, NgClass, PercentPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import {
    MatSlideToggleChange,
    MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { TurmasService } from 'app/modules/admin/apps/turmas/turmas.service';
import { Turma } from 'app/modules/admin/apps/shared/turmas.types';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CadastrarTurmaComponent } from '../labelCadastrar/cadastrarTurma.component';

@Component({
    selector: 'turmas-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CdkScrollable,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        NgClass,
        MatTooltipModule,
        MatProgressBarModule,
        MatButtonModule,
        RouterLink,
        FuseFindByKeyPipe,
        PercentPipe,
        I18nPluralPipe,
    ],
})
export class TurmasListComponent implements OnInit, OnDestroy {
    turmas: Turma[] = [];
    filteredTurmas: Turma[] = [];
    filters = {
        query$: new BehaviorSubject(''),
        hideCompleted$: new BehaviorSubject(false),
    };
    studentCounts: Map<number, number> = new Map();
    teacherCounts: Map<number, number> = new Map();


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _turmasService: TurmasService,
        private _matDialog: MatDialog,
        @Inject(DOCUMENT) private _document: any
    ) {}

    ngOnInit(): void {
        this.loadTurmas();
    
        combineLatest([
            this.filters.query$,
            this.filters.hideCompleted$,
        ]).subscribe(([query, hideCompleted]) => {
            const normalizedQuery = query.trim().toLowerCase();
            this.filteredTurmas = this.turmas.filter((turma) => {
                const suffixMatch = turma.suffix?.toLowerCase().includes(normalizedQuery);
                const yearMatch = turma.year?.toString().includes(normalizedQuery);
                const shiftMatch = this.getShiftLabel(turma.shift).toLowerCase().includes(normalizedQuery);
    
                return suffixMatch || yearMatch || shiftMatch;
            });
    
            if (hideCompleted) {
                this.filteredTurmas = this.filteredTurmas.filter(
                    (turma) => !(turma as any).completed
                );
            }
    
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }

    toggleCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted$.next(change.checked);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getShiftLabel(shift: number): string {
        return shift === 1 ? 'Manhã' : shift === 2 ? 'Tarde' : shift === 3 ? 'Noite' : '';
    }    

    addNewTurma(): void {
        const dialogRef = this._matDialog.open(CadastrarTurmaComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.loadTurmas()
            }
        });
    }

    loadTurmas(): void {
        this._turmasService.getTurmas().subscribe(() => {
            this._turmasService.turmas$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((turmas: Turma[]) => {
                    this.turmas = this.filteredTurmas = turmas;
                    this._changeDetectorRef.markForCheck();
    
                    turmas.forEach(turma => {
                        this._turmasService.getStudentCountByClassId(turma.id).subscribe(count => {
                            this.studentCounts.set(turma.id, count);
                            this._changeDetectorRef.markForCheck();
                        });
    
                        this._turmasService.getTeacherCountByClassId(turma.id).subscribe(count => {
                            this.teacherCounts.set(turma.id, count);
                            this._changeDetectorRef.markForCheck();
                        });
                    });
                });
        });
    }
    
    
}
