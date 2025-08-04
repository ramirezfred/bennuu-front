import { Routes } from '@angular/router';

import { SobrepesosComponent } from './sobrepesos.component';

export const SobrepesosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: SobrepesosComponent
    }]
}];
