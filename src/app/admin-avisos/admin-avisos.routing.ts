import { Routes } from '@angular/router';

import { AdminAvisosComponent } from './admin-avisos.component';

export const AdminAvisosRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminAvisosComponent
    }]
}];
