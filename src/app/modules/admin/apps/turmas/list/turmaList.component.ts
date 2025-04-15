import { AsyncPipe, I18nPluralPipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import {
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { TurmaService } from 'app/modules/admin/apps/turmas/turma.service';
import {
    Turma,
} from 'app/modules/admin/apps/turmas/turma.types';
import {
    Observable,
} from 'rxjs';

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
    ],
})
export class TurmaListComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    turmas$: Observable<Turma[]>;

    constructor(
        private _turmaService: TurmaService,
    ) { }

    ngOnInit(): void {
        this.turmas$ = this._turmaService.turmas$;

        this._turmaService.getTurmas().subscribe();
    }
}