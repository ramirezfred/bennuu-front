import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LbdModule } from '../lbd/lbd.module';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';

//Mis imports
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Import the library
import { NgxImageZoomModule } from 'ngx-image-zoom';


@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(DashboardRoutes),
        FormsModule,
        ReactiveFormsModule,
        LbdModule,
        NgxChartsModule,
        NgxImageZoomModule
    ],
    declarations: [DashboardComponent]
})

export class DashboardModule {}
