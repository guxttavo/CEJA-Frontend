import { AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
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
import { MatDialog } from '@angular/material/dialog';
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
import { TurmaService } from 'app/modules/admin/apps/turmas/turma.service';
import {
    Country,
    Turma,
} from 'app/modules/admin/apps/turmas/turma.types';
import {
    filter,
    fromEvent,
    Observable,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';

import { TurmaDetailsComponent } from '../details/turmaDetails.component';

@Component({
    selector: 'turma-list-component',
    templateUrl: './turmaList.component.html',
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
        NgIf
    ],
})
export class TurmaListComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    turmas$: Observable<Turma[]>;
    turmasCount: number = 0;
    drawerMode: 'side' | 'over';
    countries: Country[];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedTurma: Turma;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _turmaService: TurmaService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        @Inject(DOCUMENT) private _document: any
    ) { }

    ngOnInit(): void {
        this.turmas$ = this._turmaService.turmas$;
        this._turmaService.getTurmas().subscribe();

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
                        (event.ctrlKey === true || event.metaKey) &&
                        event.key === '/'
                )
            )
            .subscribe(() => {
                // this.createAluno();
            });

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((query) =>
                    this._turmaService.searchTurmas(query)
                )
            )
            .subscribe();

        this._turmaService.turma$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((turma: Turma) => {
                this.selectedTurma = turma;
                this._changeDetectorRef.markForCheck();
            });
    }

    addNewTurma(): void {
        this._matDialog.open(TurmaDetailsComponent, {
            autoFocus: false,
            data: {
                note: {},
            },
        });
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}