import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LbdModule } from '../lbd/lbd.module';
import { TagInputModule } from 'ngx-chips';
import { NouisliderModule } from 'ng2-nouislider';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';

import { AdminAvisosComponent } from './admin-avisos.component';
import { AdminAvisosRoutes } from './admin-avisos.routing';

import { SharedModule } from '../mis_modules/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminAvisosRoutes),
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        NouisliderModule,
        JwBootstrapSwitchNg2Module,
        LbdModule,
        SharedModule
    ],
    declarations: [
        AdminAvisosComponent
    ]
})

export class AdminAvisosModule {}
