import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Turma } from './turma.types';
import { TurmaService } from './turma.service';

@Component({
  selector: 'app-turmas',
  standalone: true,
  imports: [],
  templateUrl: './turmas.component.html'
})
export class TurmasComponent {
  turmas$: Observable<Turma[]>;

  constructor(private _turmaService: TurmaService) { }

  ngOnInit(): void {
    this._turmaService.getTurmas().subscribe();
    this.turmas$ = this._turmaService.turmas$;
  }
}
