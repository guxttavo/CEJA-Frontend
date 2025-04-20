import { AsyncPipe, DOCUMENT, I18nPluralPipe, NgClass } from '@angular/common';
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
    Country,
} from 'app/modules/admin/apps/shared/alunos.types';
import {
    Observable,
    Subject,
    filter,
    fromEvent,
    switchMap,
    takeUntil,
} from 'rxjs';
import { Aluno } from 'app/modules/admin/apps/shared/alunos.types';

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
    ],
})
export class AlunosListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    alunos$: Observable<Aluno[]>;

    alunosCount: number = 0;
    alunosTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    selectedAluno: Aluno;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _alunosService: AlunosService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) { }

    ngOnInit(): void {
        this.alunos$ = this._alunosService.alunos$;
    
        this._alunosService.getAlunos().subscribe();
    
        this.alunos$.pipe(takeUntil(this._unsubscribeAll)).subscribe((alunos) => {
            this.alunosCount = alunos?.length || 0;
            this._changeDetectorRef.markForCheck();
        });

    //     this._alunosService.aluno$
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe((aluno: Aluno) => {
    //             this.selectedAluno = aluno;
    //             this._changeDetectorRef.markForCheck();
    //         });

    //     this._alunosService.countries$
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe((countries: Country[]) => {
    //             this.countries = countries;
    //             this._changeDetectorRef.markForCheck();
    //         });

    //     this.searchInputControl.valueChanges
    //         .pipe(
    //             takeUntil(this._unsubscribeAll),
    //             switchMap((query) =>
    //                 this._alunosService.searchAlunos(query)
    //             )
    //         )
    //         .subscribe();

    //     this.matDrawer.openedChange.subscribe((opened) => {
    //         if (!opened) {
               
    //             this.selectedAluno = null;
    //             this._changeDetectorRef.markForCheck();
    //         }
    //     }
    
    // );

    //     this._fuseMediaWatcherService.onMediaChange$
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe(({ matchingAliases }) => {
    //             if (matchingAliases.includes('lg')) {
    //                 this.drawerMode = 'side';
    //             } else {
    //                 this.drawerMode = 'over';
    //             }

    //             this._changeDetectorRef.markForCheck();
    //         });

    //     fromEvent(this._document, 'keydown')
    //         .pipe(
    //             takeUntil(this._unsubscribeAll),
    //             filter<KeyboardEvent>(
    //                 (event) =>
    //                     (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
    //                     event.key === '/' // '/'
    //             )
    //         )
    //         .subscribe(() => {
    //             this.createAluno();
    //         });

    }   

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }    

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    createAluno(): void {
        // Create the aluno
        this._alunosService.createAluno().subscribe((newAluno) => {
            // Go to the new aluno
            this._router.navigate(['./', newAluno.id], {
                relativeTo: this._activatedRoute,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
