import { Routes } from '@angular/router';

import { FacturacionComponent } from './facturacion.component';

export const FacturacionRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: FacturacionComponent
    }]
}];
