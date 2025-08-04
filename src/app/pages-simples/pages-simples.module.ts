import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PagesSimplesRoutes } from './pages-simples.routing';

import { AvisoPrivacidadComponent } from './aviso-privacidad/aviso-privacidad.component';
import { RegisterComponent } from './register/register.component';
import { EmailPasswordComponent } from './email-password/email-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';

// Import the library
//import { BrowserModule } from '@angular/platform-browser';
import { NgxImageZoomModule } from 'ngx-image-zoom';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(PagesSimplesRoutes),
        FormsModule,
        ReactiveFormsModule,
        //BrowserModule,
        NgxImageZoomModule
    ],
    declarations: [
        AvisoPrivacidadComponent,
        RegisterComponent,
        EmailPasswordComponent,
        RecoverPasswordComponent
    ]
})

export class PagesSimplesModule {}
