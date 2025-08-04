import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LbdModule } from '../lbd/lbd.module';
import { TagInputModule } from 'ngx-chips';
import { NouisliderModule } from 'ng2-nouislider';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';

import { AdminUsuariosComponent } from './admin-usuarios.component';
import { AdminUsuariosRoutes } from './admin-usuarios.routing';

import { SharedModule } from '../mis_modules/shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminUsuariosRoutes),
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        NouisliderModule,
        JwBootstrapSwitchNg2Module,
        LbdModule,
        SharedModule
    ],
    declarations: [
        AdminUsuariosComponent
    ]
})

export class AdminUsuariosModule {}
