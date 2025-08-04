import { Routes } from '@angular/router';

import { AdminFacturasComponent } from './admin-facturas.component';

export const AdminFacturasRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminFacturasComponent
    }]
}];
