import { Routes } from '@angular/router';

import { AdminUsuariosComponent } from './admin-usuarios.component';

export const AdminUsuariosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminUsuariosComponent
    }]
}];
