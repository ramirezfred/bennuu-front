import { Routes } from '@angular/router';

import { AdminPaqueteriasComponent } from './admin-paqueterias.component';

export const AdminPaqueteriasRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminPaqueteriasComponent
    }]
}];
