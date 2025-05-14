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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Student } from 'app/modules/admin/apps/shared/student.types';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
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
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            document: ['', Validators.required],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            bornDate: ['', Validators.required],
            roleId: [null, Validators.required],
            avatar: [''],
        });

    }

    selectUserType(type: 'student' | 'teacher'): void {
        const roleId = type === 'student' ? 3 : 2;
        this.signUpForm.get('roleId')?.setValue(roleId);
    }

    signUp(): void {
        const userData: Student = this.signUpForm.value;

        if (userData.roleId === 3) {
            this._authService.signUpStudent(userData).subscribe(
                () => this._router.navigateByUrl('/confirmation-required'),
                (err) => {
                    this.alert = {
                        type: 'error',
                        message: err || 'Erro ao cadastrar aluno.',
                    };
                    this.showAlert = true;
                }
            );
        } else if (userData.roleId === 2) {
            this._authService.signUpTeacher(userData).subscribe(
                () => this._router.navigateByUrl('/confirmation-required'),
                (err) => {
                    this.alert = {
                        type: 'error',
                        message: err || 'Erro ao cadastrar professor.',
                    };
                    this.showAlert = true;
                }
            );
        }
    }

}
