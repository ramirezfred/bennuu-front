import { Routes } from '@angular/router';

import { AdminGuiasComponent } from './admin-guias.component';

export const AdminGuiasRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: AdminGuiasComponent
    }]
}];
