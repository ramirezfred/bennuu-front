import { Routes } from '@angular/router';

import { NuevoEnvioComponent } from './nuevo-envio.component';

export const NuevoEnvioRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: NuevoEnvioComponent
    }]
}];
