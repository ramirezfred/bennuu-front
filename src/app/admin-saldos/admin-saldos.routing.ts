import { Routes } from '@angular/router';

import { AdminSaldosComponent } from './admin-saldos.component';

export const AdminSaldosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminSaldosComponent
    }]
}];
