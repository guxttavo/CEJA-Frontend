import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AproveTeachersComponent } from "./aprove-teachers/aprove-teachers.component";

@Component({
    selector: 'turmas',
    templateUrl: './admin-page.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet, AproveTeachersComponent],
})
export class AdminPageComponent {
    constructor() {}
}
