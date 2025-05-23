import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        CommonModule
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    selectedRole: 'student' | 'teacher' | null = null;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [false],
            roleId: [1, Validators.required]
        });
    }

    selectUserType(type: 'student' | 'teacher'): void {
        const roleId = type === 'student' ? 3 : 2;
        this.signInForm.get('roleId')?.setValue(roleId);
        this.selectedRole = type;
    }

    signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        if (!this.signInForm.get('roleId')?.value) {
            this.signInForm.get('roleId')?.setValue(1);
        }

        const credentials = this.signInForm.value;

        this._authService.signIn({
            email: credentials.email,
            password: credentials.password,
            rememberMe: credentials.rememberMe ?? false,
            roleId: credentials.roleId
        }).subscribe(
            () => {
                const role = credentials.roleId;
                if (role === 3) {
                    const redirectURL =
                        this._activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL'
                        ) || '/admin/turmas';

                    this._router.navigateByUrl(redirectURL);

                } else if (role === 2) {
                    const redirectURL =
                        this._activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL'
                        ) || '/admin/alunos';

                    this._router.navigateByUrl(redirectURL);
                } else {
                    const redirectURL =
                        this._activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL'
                        ) || '/signed-in-redirect';

                    this._router.navigateByUrl(redirectURL);
                }
            },
            (error) => {
                this.alert = {
                    type: 'error',
                    message: error || 'Erro ao realizar login.'
                };
                this.showAlert = true;
            }
        );
    }

}
