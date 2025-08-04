import { Routes } from '@angular/router';

import { MisGuiasComponent } from './mis-guias.component';

export const MisGuiasRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: MisGuiasComponent
    }]
}];
