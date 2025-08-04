import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { SimpleLayoutComponent } from './layouts/simple/simple-layout.component';

import { AuthGuard } from './guards/auth.guard';

export const AppRoutes: Routes = [{
        path: '',
        //redirectTo: 'pages/login',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },{
        path: '',
        component: AdminLayoutComponent,
        children: [{
            path: '',
            loadChildren: () => import('./dashboard/dashboard.module').then(x=>x.DashboardModule),
            canActivate: [ AuthGuard ]
        },{
            path: 'components',
            loadChildren: () => import('./components/components.module').then(x=>x.ComponentsModule)
        },{
            path: 'forms',
            loadChildren: () => import('./forms/forms.module').then(x=>x.Forms)
        },{
            path: 'tables',
            loadChildren: () => import('./tables/tables.module').then(x=>x.TablesModule)
        },{
            path: 'maps',
            loadChildren: () => import('./maps/maps.module').then(x=>x.MapsModule)
        },{
            path: 'charts',
            loadChildren: () => import('./charts/charts.module').then(x=>x.ChartsModule)
        },

        //Modulos Bennuu
        {
            path: 'mis-guias',
            loadChildren: () => import('./mis-guias/mis-guias.module').then(x=>x.MisGuiasModule)
        },
        {
            path: 'facturacion',
            loadChildren: () => import('./facturacion/facturacion.module').then(x=>x.FacturacionModule)
        },
        {
            path: 'configuracion',
            loadChildren: () => import('./configuracion/configuracion.module').then(x=>x.ConfiguracionModule)
        },
        {
            path: 'sobrepesos',
            loadChildren: () => import('./sobrepesos/sobrepesos.module').then(x=>x.SobrepesosModule)
        },
        {
            path: 'saldo',
            loadChildren: () => import('./saldo/saldo.module').then(x=>x.SaldoModule)
        },
        {
            path: 'cotizador-interno',
            loadChildren: () => import('./cotizador-interno/cotizador-interno.module').then(x=>x.CotizadorInternoModule)
        },
        {
            path: 'nuevo-envio',
            loadChildren: () => import('./nuevo-envio/nuevo-envio.module').then(x=>x.NuevoEnvioModule)
        },
        {
            path: 'nuevo-envio-prepagado',
            loadChildren: () => import('./nuevo-envio-prepagado/nuevo-envio-prepagado.module').then(x=>x.NuevoEnvioPrepagadoModule)
        },
        {
            path: 'sub-usuarios',
            loadChildren: () => import('./sub-usuarios/sub-usuarios.module').then(x=>x.SubUsuariosModule)
        },

        {
            path: 'admin-usuarios',
            loadChildren: () => import('./admin-usuarios/admin-usuarios.module').then(x=>x.AdminUsuariosModule)
        },
        {
            path: 'admin-guias',
            loadChildren: () => import('./admin-guias/admin-guias.module').then(x=>x.AdminGuiasModule)
        },
        {
            path: 'admin-facturas',
            loadChildren: () => import('./admin-facturas/admin-facturas.module').then(x=>x.AdminFacturasModule)
        },
        {
            path: 'admin-saldos',
            loadChildren: () => import('./admin-saldos/admin-saldos.module').then(x=>x.AdminSaldosModule)
        },
        {
            path: 'admin-paquetes-prepagados',
            loadChildren: () => import('./admin-paquetes-prepagados/admin-paquetes-prepagados.module').then(x=>x.AdminPaquetesPrepagadosModule)
        },
        {
            path: 'admin-paqueterias',
            loadChildren: () => import('./admin-paqueterias/admin-paqueterias.module').then(x=>x.AdminPaqueteriasModule)
        },


        {
            path: '',
            loadChildren: () => import('./userpage/user.module').then(x=>x.UserModule)
        }]
        },{
            path: '',
            component: AuthLayoutComponent,
            children: [{
                path: 'pages',
                loadChildren: () => import('./pages/pages.module').then(x=>x.PagesModule)
            }]
        },{
            path: '',
            component: SimpleLayoutComponent,
            children: [{
                path: 'pages-simples',
                loadChildren: () => import('./pages-simples/pages-simples.module').then(x=>x.PagesSimplesModule)
            }]
        }
];
