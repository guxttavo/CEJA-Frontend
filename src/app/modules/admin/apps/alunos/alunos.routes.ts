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

    return alunosService.getAlunoById(route.paramMap.get('id')).pipe(
        // Error here means the requested aluno is not available
        catchError((error) => {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
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

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
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
                    // alunos: () => inject(AlunosService).getAlunos(),
                    // countries: () => inject(AlunosService).getCountries(),
                },
                children: [
                    {
                        path: ':id',
                        component: AlunosDetailsComponent,
                        resolve: {
                            aluno: alunoResolver,
                            countries: () =>
                                inject(AlunosService).getCountries(),
                        },
                        canDeactivate: [canDeactivateAlunosDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
