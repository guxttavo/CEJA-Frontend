import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'auth-forgot-password',
    templateUrl: './forgot-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthForgotPasswordComponent implements OnInit {
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    forgotPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder
    ) {}

    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

    sendResetLink(): void {
        if (this.forgotPasswordForm.invalid) {
            return;
        }

        this.forgotPasswordForm.disable();
        this.showAlert = false;

        this._authService
            .forgotPassword(this.forgotPasswordForm.get('email').value)
            .pipe(
                finalize(() => {
                    this.forgotPasswordForm.enable();
                    this.forgotPasswordNgForm.resetForm();
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {
                    this.alert = {
                        type: 'success',
                        message:
                            'Redefinição de senha enviada! Você receberá um e-mail se estiver registrado em nosso sistema.',
                    };
                },
                (response) => {
                    this.alert = {
                        type: 'error',
                        message:
                            'E-mail não encontrado! Tem certeza de que já é um membro?',
                    };
                }
            );
    }
}
