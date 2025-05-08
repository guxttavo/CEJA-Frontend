import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { StudentsService } from './students.service';
import { Student } from 'app/modules/admin/apps/shared/students.types';

@Component({
    selector: 'alunos',
    templateUrl: './students.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet],
})
export class StudentsComponent {
    alunos$: Observable<Student[]>;

    constructor(private _studentsService: StudentsService) {}

    ngOnInit(): void {
        this._studentsService.getAllStudents().subscribe();
        this.alunos$ = this._studentsService.alunos$;  
    }
}
