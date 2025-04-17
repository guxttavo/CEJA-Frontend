import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { TurmasComponent } from 'app/modules/admin/apps/turmas/turmas.component';
import { TurmaService } from 'app/modules/admin/apps/turmas/turma.service';
// import { TurmasDetailsComponent } from 'app/modules/admin/apps/alunos/details/details.component';
import { TurmaListComponent } from 'app/modules/admin/apps/turmas/list/turmaList.component';
import { catchError, throwError } from 'rxjs';

const turmaResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const turmasService = inject(TurmaService);
    const router = inject(Router);

    return turmasService.getTurmaById(Number(route.paramMap.get('id'))).pipe(
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
    // component: AlunosDetailsComponent, 
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
    if (!nextState.url.includes('/turmas')) {
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
        component: TurmasComponent,
        children: [
            {
                path: '',
                component: TurmaListComponent
            }
        ]
    },
] as Routes;
