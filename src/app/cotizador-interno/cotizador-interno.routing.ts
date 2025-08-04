import { Routes } from '@angular/router';

import { CotizadorInternoComponent } from './cotizador-interno.component';

export const CotizadorInternoRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: CotizadorInternoComponent
    }]
}];
