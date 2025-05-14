import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Teacher } from '../../shared/teacher.types';
import { TeacherService } from '../../teachers/teacher.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-aprove-teachers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './aprove-teachers.component.html'
})
export class AproveTeachersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'status'];
  teachers = new MatTableDataSource<Teacher>();

  constructor(private _teacherService: TeacherService) { }

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this._teacherService.getAllTeachers().subscribe({
      next: (data) => {
        this.teachers.data = data; // importante
      },
      error: (err) => {
        console.error('Erro ao buscar professores:', err);
      }
    });
  }

  filterByQuery(query: string): void {
    console.log('Filtrando por:', query);
  }
}
