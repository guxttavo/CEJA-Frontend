import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { StudentsComponent } from 'app/modules/admin/apps/students/students.component';
import { StudentsService } from 'app/modules/admin/apps/students/students.service';
import { AlunosDetailsComponent } from 'app/modules/admin/apps/students/details/studentsDetails.component';
import { AlunosListComponent } from 'app/modules/admin/apps/students/list/studentsList.component';
import { catchError, throwError } from 'rxjs';

const studentResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const studentService = inject(StudentsService);
    const router = inject(Router);

    const idParam = route.paramMap.get('id');
    const id = idParam ? + idParam : null;

    if (id === null) {
        router.navigateByUrl(state.url.split('/').slice(0, -1).join('/'));
        return throwError(() => new Error('ID inválido'));
    }

    return studentService.getStudentById(id).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            router.navigateByUrl(parentUrl);

            return throwError(error);
        })
    );
};

const canDeactivateStudentDetails = (
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

    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: StudentsComponent,
        // resolve: {
        //     tags: () => inject(AlunosService).getTags(),
        // },
        children: [
            {
                path: '',
                component: AlunosListComponent,
                resolve: {
                    alunos: () => inject(StudentsService).getAllStudents()
                },
                children: [
                    {
                        path: ':id',
                        component: AlunosDetailsComponent,
                        resolve: {
                            alunos: studentResolver
                        },
                        canDeactivate: [canDeactivateStudentDetails],
                        runGuardsAndResolvers: 'paramsChange' 
                    },
                ],
            },
        ],
    },
] as Routes;
