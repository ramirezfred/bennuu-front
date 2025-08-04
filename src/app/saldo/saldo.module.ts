import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LbdModule } from '../lbd/lbd.module';
import { TagInputModule } from 'ngx-chips';
import { NouisliderModule } from 'ng2-nouislider';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';

import { SaldoComponent } from './saldo.component';
import { SaldoRoutes } from './saldo.routing';

import { SharedModule } from '../mis_modules/shared/shared.module';

import { TddTdcComponent } from './componentes/tdd-tdc/tdd-tdc.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SaldoRoutes),
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        NouisliderModule,
        JwBootstrapSwitchNg2Module,
        LbdModule,
        SharedModule
    ],
    declarations: [
        SaldoComponent,
        TddTdcComponent
    ]
})

export class SaldoModule {}
