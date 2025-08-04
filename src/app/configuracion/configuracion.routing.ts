import { Routes } from '@angular/router';

import { ConfiguracionComponent } from './configuracion.component';

export const ConfiguracionRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: ConfiguracionComponent
    }]
}];
