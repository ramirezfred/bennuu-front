import { Routes } from '@angular/router';

import { AvisoPrivacidadComponent } from './aviso-privacidad/aviso-privacidad.component';
import { RegisterComponent } from './register/register.component';
import { EmailPasswordComponent } from './email-password/email-password.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';

export const PagesSimplesRoutes: Routes = [{
    path: '',
    children: [ {
        path: 'aviso-privacidad',
        component: AvisoPrivacidadComponent
    },{
        path: 'register',
        component: RegisterComponent
    },{
        path: 'email-password',
        component: EmailPasswordComponent
    },{
        path: 'recover-password/:token',
        component: RecoverPasswordComponent
    }]
}];
