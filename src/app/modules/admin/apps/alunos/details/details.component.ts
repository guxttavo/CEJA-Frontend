import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AlunosService } from 'app/modules/admin/apps/alunos/alunos.service';
import {
    Aluno,
} from 'app/modules/admin/apps/alunos/alunos.types';
import { AlunosListComponent } from 'app/modules/admin/apps/alunos/list/list.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
    selector: 'alunos-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        NgClass,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TextFieldModule,
        FuseFindByKeyPipe,
        DatePipe,
        NgIf
    ],
})
export class AlunosDetailsComponent implements OnInit {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    aluno: Aluno;
    alunoForm: UntypedFormGroup;
    alunos: Aluno[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _alunosListComponent: AlunosListComponent,
        private _alunosService: AlunosService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) { }

    ngOnInit(): void {
        this._alunosListComponent.matDrawer.open();
    
        this.alunoForm = this._formBuilder.group({
            id: [''],
            avatar: [null],
            registrationNumber: [null],
            name: ['', [Validators.required]],
            email: [''],
            phone: [''],
            address: [''],
            bornDate: [null],
        });
    
        // Reage a troca de ID na URL
        this._activatedRoute.paramMap
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(params => {
                const id = +params.get('id');
                if (id) {
                    this._alunosService.getAlunoById(id).subscribe();
                }
            });
    
        // Atualiza a UI quando o aluno mudar
        this._alunosService.aluno$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((aluno: Aluno) => {
                if (!aluno) return;
    
                this.aluno = aluno;
                this.alunoForm.patchValue(aluno);
                this._changeDetectorRef.markForCheck();
            });
    }
    

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._alunosListComponent.matDrawer.close();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
