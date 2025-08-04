import { Routes } from '@angular/router';

import { NuevoEnvioPrepagadoComponent } from './nuevo-envio-prepagado.component';

export const NuevoEnvioPrepagadoRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: NuevoEnvioPrepagadoComponent
    }]
}];
