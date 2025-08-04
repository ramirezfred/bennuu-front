import { Routes } from '@angular/router';

import { SubUsuariosComponent } from './sub-usuarios.component';

export const SubUsuariosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: SubUsuariosComponent
    }]
}];
