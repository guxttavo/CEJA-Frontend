import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AlunosService } from './alunos.service';
import { Aluno } from 'app/modules/admin/apps/shared/alunos.types';

@Component({
    selector: 'alunos',
    templateUrl: './alunos.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet],
})
export class AlunosComponent {
    alunos$: Observable<Aluno[]>;

    constructor(private _alunosService: AlunosService) {}

    ngOnInit(): void {
        this._alunosService.getAllStudents().subscribe(); // dispara a requisição
        this.alunos$ = this._alunosService.alunos$;  // observa os dados atualizados
    }
}
