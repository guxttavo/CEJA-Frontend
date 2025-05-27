import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { TurmasComponent } from 'app/modules/admin/apps/turmas/turmas.component';
import { TurmasService } from 'app/modules/admin/apps/turmas/turmas.service';
import { TurmasDetailsComponent } from 'app/modules/admin/apps/turmas/details/details.component';
import { ClassListComponent } from 'app/modules/admin/apps/turmas/list/classList.component';
import { catchError, throwError } from 'rxjs';

const turmaResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const turmasService = inject(TurmasService);
    const router = inject(Router);

    return turmasService.getTurmaComAlunos(route.paramMap.get('id')).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(() => error);
        })
    );
};

export default [
    {
        path: '',
        component: TurmasComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: ClassListComponent,
                resolve: {
                    turmas: () => inject(TurmasService).getTurmas(),
                },
            },
            {
                path: ':id',
                component: TurmasDetailsComponent,
                resolve: {
                    turma: turmaResolver,
                },
            },
        ],
    },
] as Routes;
