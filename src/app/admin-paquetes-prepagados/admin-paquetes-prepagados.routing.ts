import { Routes } from '@angular/router';

import { AdminPaquetesPrepagadosComponent } from './admin-paquetes-prepagados.component';

export const AdminPaquetesPrepagadosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminPaquetesPrepagadosComponent
    }]
}];
