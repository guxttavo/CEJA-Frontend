import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { AlunosComponent } from 'app/modules/admin/apps/alunos/alunos.component';
import { AlunosService } from 'app/modules/admin/apps/alunos/alunos.service';
import { AlunosDetailsComponent } from 'app/modules/admin/apps/alunos/details/details.component';
import { AlunosListComponent } from 'app/modules/admin/apps/alunos/list/list.component';
import { catchError, throwError } from 'rxjs';

/**
 * Aluno resolver
 *
 * @param route
 * @param state
 */
const alunoResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const alunosService = inject(AlunosService);
    const router = inject(Router);

    const idParam = route.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id === null) {
        router.navigateByUrl(state.url.split('/').slice(0, -1).join('/'));
        return throwError(() => new Error('ID inválido'));
    }

    return alunosService.getAlunoById(id).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(error);
        })
    );
};

/**
 * Can deactivate alunos details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateAlunosDetails = (
    component: AlunosDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/alunos'
    // it means we are navigating away from the
    // alunos app
    if (!nextState.url.includes('/alunos')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another aluno...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

};

export default [
    {
        path: '',
        component: AlunosComponent,
        // resolve: {
        //     tags: () => inject(AlunosService).getTags(),
        // },
        children: [
            {
                path: '',
                component: AlunosListComponent,
                resolve: {
                    alunos: () => inject(AlunosService).getAllStudents()
                },
                children: [
                    {
                        path: ':id',
                        component: AlunosDetailsComponent,
                        resolve: {
                            alunos: alunoResolver
                        },
                        canDeactivate: [canDeactivateAlunosDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
