import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass } from '@angular/common';
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
    Country,
    Tag,
} from 'app/modules/admin/apps/shared/alunos.types';
import { AlunosListComponent } from 'app/modules/admin/apps/alunos/list/list.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Aluno } from 'app/modules/admin/apps/shared/alunos.types';

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
    ],
})
export class AlunosDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tags: Tag[];
    tagsEditMode: boolean = false;
    filteredTags: Tag[];
    aluno: Aluno;
    alunoForm: UntypedFormGroup;
    alunos: Aluno[];
    countries: Country[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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
    ) {}

    ngOnInit(): void {
        this._alunosListComponent.matDrawer.open();

        this.alunoForm = this._formBuilder.group({
            id: [''],
            avatar: [null],
            name: ['', [Validators.required]],
            email: ['', [Validators.email]],
            document: [''],
            phone: [''],
            address: [''],
            borndate: [null],
        });

        this._alunosService.alunos$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((alunos: Aluno[]) => {
                this.alunos = alunos;
                this._changeDetectorRef.markForCheck();
            });

        this._alunosService.aluno$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((aluno: Aluno) => {
                this._alunosListComponent.matDrawer.open();
                this.aluno = aluno;
                (this.alunoForm.get('emails') as UntypedFormArray).clear();
                (
                    this.alunoForm.get('phoneNumbers') as UntypedFormArray
                ).clear();
                this.alunoForm.patchValue(aluno);

                const emailFormGroups = [];

                // if (aluno.emails.length > 0) {
                //     aluno.emails.forEach((email) => {
                //         emailFormGroups.push(
                //             this._formBuilder.group({
                //                 email: [email.email],
                //                 label: [email.label],
                //             })
                //         );
                //     });
                // } else {
                //     emailFormGroups.push(
                //         this._formBuilder.group({
                //             email: [''],
                //             label: [''],
                //         })
                //     );
                // }

                emailFormGroups.forEach((emailFormGroup) => {
                    (this.alunoForm.get('emails') as UntypedFormArray).push(
                        emailFormGroup
                    );
                });

                const phoneNumbersFormGroups = [];

                if (aluno.phoneNumbers.length > 0) {
                    aluno.phoneNumbers.forEach((phoneNumber) => {
                        phoneNumbersFormGroups.push(
                            this._formBuilder.group({
                                country: [phoneNumber.country],
                                phoneNumber: [phoneNumber.phoneNumber],
                                label: [phoneNumber.label],
                            })
                        );
                    });
                } else {
                    phoneNumbersFormGroups.push(
                        this._formBuilder.group({
                            country: ['us'],
                            phoneNumber: [''],
                            label: [''],
                        })
                    );
                }

                phoneNumbersFormGroups.forEach((phoneNumbersFormGroup) => {
                    (
                        this.alunoForm.get('phoneNumbers') as UntypedFormArray
                    ).push(phoneNumbersFormGroup);
                });

                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });

        this._alunosService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) => {
                this.countries = codes;
                this._changeDetectorRef.markForCheck();
            });

        this._alunosService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;
                this.filteredTags = tags;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._alunosListComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    updateAluno(): void {
        const aluno = this.alunoForm.getRawValue();
        aluno.emails = aluno.emails.filter((email) => email.email);
        aluno.phoneNumbers = aluno.phoneNumbers.filter(
            (phoneNumber) => phoneNumber.phoneNumber
        );
        this._alunosService.updateAluno(aluno.id, aluno).subscribe(() => {
            this.toggleEditMode(false);
        });
    }

    deleteAluno(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete aluno',
            message:
                'Are you sure you want to delete this aluno? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const id = this.aluno.id;
                const currentAlunoIndex = this.alunos.findIndex(
                    (item) => item.id === id
                );
                const nextAlunoIndex =
                    currentAlunoIndex +
                    (currentAlunoIndex === this.alunos.length - 1 ? -1 : 1);
                const nextAlunoId =
                    this.alunos.length === 1 && this.alunos[0].id === id
                        ? null
                        : this.alunos[nextAlunoIndex].id;

                this._alunosService.deleteAluno(id).subscribe((isDeleted) => {
                    if (!isDeleted) {
                        return;
                    }

                    if (nextAlunoId) {
                        this._router.navigate(['../', nextAlunoId], {
                            relativeTo: this._activatedRoute,
                        });
                    } else {
                        this._router.navigate(['../'], {
                            relativeTo: this._activatedRoute,
                        });
                    }

                    this.toggleEditMode(false);
                });

                this._changeDetectorRef.markForCheck();
            }
        });
    }

    uploadAvatar(fileList: FileList): void {
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        if (!allowedTypes.includes(file.type)) {
            return;
        }

        this._alunosService.uploadAvatar(this.aluno.id, file).subscribe();
    }

    removeAvatar(): void {
        const avatarFormControl = this.alunoForm.get('avatar');
        avatarFormControl.setValue(null);
        this._avatarFileInput.nativeElement.value = null;
        this.aluno.avatar = null;
    }

    openTagsPanel(): void {
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        this._tagsPanelOverlayRef.attachments().subscribe(() => {
            this._renderer2.addClass(
                this._tagsPanelOrigin.nativeElement,
                'panel-opened'
            );

            this._tagsPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        const templatePortal = new TemplatePortal(
            this._tagsPanel,
            this._viewContainerRef
        );

        this._tagsPanelOverlayRef.attach(templatePortal);

        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {
            this._renderer2.removeClass(
                this._tagsPanelOrigin.nativeElement,
                'panel-opened'
            );

            if (
                this._tagsPanelOverlayRef &&
                this._tagsPanelOverlayRef.hasAttached()
            ) {
                this._tagsPanelOverlayRef.detach();
                this.filteredTags = this.tags;
                this.tagsEditMode = false;
            }

            if (templatePortal && templatePortal.isAttached) {
                templatePortal.detach();
            }
        });
    }

    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    filterTags(event): void {
        const value = event.target.value.toLowerCase();
        this.filteredTags = this.tags.filter((tag) =>
            tag.title.toLowerCase().includes(value)
        );
    }

    filterTagsInputKeyDown(event): void {
        if (event.key !== 'Enter') {
            return;
        }

        if (this.filteredTags.length === 0) {
            this.createTag(event.target.value);
            event.target.value = '';
            return;
        }

        const tag = this.filteredTags[0];
        const isTagApplied = this.aluno.tags.find((id) => id === tag.id);

        if (isTagApplied) {
            this.removeTagFromAluno(tag);
        } else {
            this.addTagToAluno(tag);
        }
    }

    createTag(title: string): void {
        const tag = {
            title,
        };

        this._alunosService.createTag(tag).subscribe((response) => {
            this.addTagToAluno(response);
        });
    }

    updateTagTitle(tag: Tag, event): void {
        tag.title = event.target.value;

        this._alunosService
            .updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        this._changeDetectorRef.markForCheck();
    }

    deleteTag(tag: Tag): void {
        this._alunosService.deleteTag(tag.id).subscribe();
        this._changeDetectorRef.markForCheck();
    }

    addTagToAluno(tag: Tag): void {
        this.aluno.tags.unshift(tag.id);
        this.alunoForm.get('tags').patchValue(this.aluno.tags);
        this._changeDetectorRef.markForCheck();
    }

    removeTagFromAluno(tag: Tag): void {
        this.aluno.tags.splice(
            this.aluno.tags.findIndex((item) => item === tag.id),
            1
        );
        this.alunoForm.get('tags').patchValue(this.aluno.tags);
        this._changeDetectorRef.markForCheck();
    }

    toggleAlunoTag(tag: Tag): void {
        if (this.aluno.tags.includes(tag.id)) {
            this.removeTagFromAluno(tag);
        } else {
            this.addTagToAluno(tag);
        }
    }

    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.tags.findIndex(
                (tag) => tag.title.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    addEmailField(): void {
        const emailFormGroup = this._formBuilder.group({
            email: [''],
            label: [''],
        });

        (this.alunoForm.get('emails') as UntypedFormArray).push(
            emailFormGroup
        );

        this._changeDetectorRef.markForCheck();
    }

    removeEmailField(index: number): void {
        const emailsFormArray = this.alunoForm.get(
            'emails'
        ) as UntypedFormArray;

        emailsFormArray.removeAt(index);

        this._changeDetectorRef.markForCheck();
    }

    addPhoneNumberField(): void {
        const phoneNumberFormGroup = this._formBuilder.group({
            country: ['us'],
            phoneNumber: [''],
            label: [''],
        });

        (this.alunoForm.get('phoneNumbers') as UntypedFormArray).push(
            phoneNumberFormGroup
        );

        this._changeDetectorRef.markForCheck();
    }

    removePhoneNumberField(index: number): void {
        const phoneNumbersFormArray = this.alunoForm.get(
            'phoneNumbers'
        ) as UntypedFormArray;

        phoneNumbersFormArray.removeAt(index);

        this._changeDetectorRef.markForCheck();
    }

    getCountryByIso(iso: string): Country {
        return this.countries.find((country) => country.iso === iso);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
