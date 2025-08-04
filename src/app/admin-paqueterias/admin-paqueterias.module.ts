import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LbdModule } from '../lbd/lbd.module';
import { TagInputModule } from 'ngx-chips';
import { NouisliderModule } from 'ng2-nouislider';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';

import { AdminPaqueteriasComponent } from './admin-paqueterias.component';
import { AdminPaqueteriasRoutes } from './admin-paqueterias.routing';

import { SharedModule } from '../mis_modules/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminPaqueteriasRoutes),
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        NouisliderModule,
        JwBootstrapSwitchNg2Module,
        LbdModule,
        SharedModule
    ],
    declarations: [
        AdminPaqueteriasComponent
    ]
})

export class AdminPaqueteriasModule {}
