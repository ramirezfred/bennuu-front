import { Routes } from '@angular/router';

import { SaldoComponent } from './saldo.component';

export const SaldoRoutes: Routes = [{
    path: '',
    children: [{
        path: '',
        component: SaldoComponent
    }]
}];
