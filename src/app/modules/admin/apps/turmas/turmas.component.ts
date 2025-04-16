import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Turma } from './turma.types';
import { TurmaService } from './turma.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'turmas',
  templateUrl: './turmas.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class TurmasComponent {
  turmas$: Observable<Turma[]>;

  constructor(private _turmaService: TurmaService) { }

  ngOnInit(): void {
    this._turmaService.getTurmas().subscribe();
    this.turmas$ = this._turmaService.turmas$;
  }
}
