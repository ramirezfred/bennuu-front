import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';

import { APIService } from '../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { SesionService } from '../services/sesion/sesion.service';

import Swal from 'sweetalert2';

declare var $:any;
//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    // icon: string;
    children?: ChildrenItems[];
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

/*Roles
1=SuperAdmin, 
2=PersonalOperativo, 
3=JefeOperaciones, 
4=JefeGestionForestal, 
5=JefeFinanzas, 
6=Invitado*/

//Menu Items
export const ROUTESRol1: RouteInfo[] = [{
        path: '/dashboard',
        title: 'Bennuu',
        type: 'link',
        icontype: 'pe-7s-graph'
    },
    {
        path: '/admin-usuarios',
        title: 'Usuarios',
        type: 'link',
        icontype: 'fa fa-users'
    },
    {
        path: '/admin-guias',
        title: 'Guías',
        type: 'link',
        icontype: 'pe-7s-note2'
    },
    {
        path: '/admin-facturas',
        title: 'Facturas',
        type: 'link',
        icontype: 'fa fa-bar-chart'
    },
    {
        path: '/admin-saldos',
        title: 'Saldos',
        type: 'link',
        icontype: 'fa fa-fire'
    },
    {
        path: '/admin-paquetes-prepagados',
        title: 'Paquetes prepagados',
        type: 'link',
        icontype: 'fa fa-gift'
    },
    {
        path: '/admin-paqueterias',
        title: 'Paqueterías',
        type: 'link',
        icontype: 'fa fa-space-shuttle'
    },
];


export const ROUTESRol2: RouteInfo[] = [
    {
        path: '/dashboard',
        title: 'Bennuu',
        type: 'link',
        icontype: 'pe-7s-graph'
    },
    {
        path: '/nuevo-envio',
        title: 'Nuevo Envío',
        type: 'link',
        icontype: 'pe-7s-mail'
    },
    {
        path: '/nuevo-envio-prepagado',
        title: 'Guía prepagada',
        type: 'link',
        icontype: 'pe-7s-mail'
    },
    {
        path: '/cotizador-interno',
        title: 'Cotizar',
        type: 'link',
        icontype: 'fa fa-paper-plane-o'
    },
    {
        path: '/mis-guias',
        title: 'Mis Guías',
        type: 'link',
        icontype: 'pe-7s-note2'
    },
    {
        path: '/saldo',
        title: 'Saldo',
        type: 'link',
        icontype: 'fa fa-fire'
    },
    {
        path: '/facturacion',
        title: 'Movimientos',
        type: 'link',
        icontype: 'fa fa-bar-chart'
    },
    {
        path: '/sobrepesos',
        title: 'Cargos adicionales',
        type: 'link',
        icontype: 'pe-7s-cloud-download'
    },
    {
        path: '/sub-usuarios',
        title: 'Subusuarios',
        type: 'link',
        icontype: 'fa fa-users'
    },
    {
        path: '/configuracion',
        title: 'Configuración',
        type: 'link',
        icontype: 'pe-7s-tools'
    }

];

//Subusuario
export const ROUTESRol2_2: RouteInfo[] = [
    {
        path: '/dashboard',
        title: 'Bennuu',
        type: 'link',
        icontype: 'pe-7s-graph'
    },
    {
        path: '/nuevo-envio',
        title: 'Nuevo Envío',
        type: 'link',
        icontype: 'pe-7s-mail'
    },
    {
        path: '/nuevo-envio-prepagado',
        title: 'Guía prepagada',
        type: 'link',
        icontype: 'pe-7s-mail'
    },
    {
        path: '/cotizador-interno',
        title: 'Cotizar',
        type: 'link',
        icontype: 'fa fa-paper-plane-o'
    },
    {
        path: '/mis-guias',
        title: 'Mis Guías',
        type: 'link',
        icontype: 'pe-7s-note2'
    },
    // {
    //     path: '/saldo',
    //     title: 'Saldo',
    //     type: 'link',
    //     icontype: 'fa fa-fire'
    // },
    {
        path: '/facturacion',
        title: 'Movimientos',
        type: 'link',
        icontype: 'fa fa-bar-chart'
    },
    {
        path: '/sobrepesos',
        title: 'Cargos adicionales',
        type: 'link',
        icontype: 'pe-7s-cloud-download'
    },
    {
        path: '/configuracion',
        title: 'Configuración',
        type: 'link',
        icontype: 'pe-7s-tools'
    }

];

export const ROUTESRolNot: RouteInfo[] = [];

@Component({
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent {
    public menuItems: any[];

    user_rol = null;
    user_subusuario = null;

    user : any = null;
    nombre_empresa = null;
    nombre_subuser = null;

    constructor(
          private router: Router,
          private sesion_serv: SesionService,
          private api_serv: APIService,
            private http: HttpClient,
    ) {
        this.user_rol  =  this.sesion_serv.getUserRol();
        this.user_subusuario  =  this.sesion_serv.getUserSubUsuario();
        //console.log(this.user_subusuario);

        this.user = this.sesion_serv.getUser();

        if(this.user?.tipo_usuario == 2){
            if(this.user?.nombre_empresa){
                this.nombre_empresa = this.user.nombre_empresa;
            }
            if(this.user?.nombre_subuser){
                this.nombre_subuser = this.user.nombre_subuser;
            }
        }
    }

    isNotMobileMenu(){
        if($(window).width() > 991){
            return false;
        }
        return true;
    }

    ngOnInit() {
        var isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

        var rol = this.sesion_serv.getUserRol();

        if(rol == 1){
            this.menuItems = ROUTESRol1.filter(menuItem => menuItem);
        }else if(rol == 2){
            if(!this.user_subusuario){
                this.menuItems = ROUTESRol2.filter(menuItem => menuItem);
            }else{
                this.menuItems = ROUTESRol2_2.filter(menuItem => menuItem);
            }
            
        }else{
            this.menuItems = ROUTESRolNot.filter(menuItem => menuItem);
        }

        isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

        if (isWindows){
           // if we are on windows OS we activate the perfectScrollbar function
           $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
           $('html').addClass('perfect-scrollbar-on');
       } else {
           $('html').addClass('perfect-scrollbar-off');
       }
    }
    ngAfterViewInit(){
        var $sidebarParent = $('.sidebar .nav > li.active .collapse li.active > a').parent().parent().parent();

        var collapseId = $sidebarParent.siblings('a').attr("href");

        $(collapseId).collapse("show");
    }

    logout() {
        
        Swal.fire({
          title: '¿Está seguro?',
          text: `Está seguro que desea cerrar sesión`,
          icon: 'question',
          showConfirmButton: true,
          showCancelButton: true
        }).then( resp => {

            if ( resp.value ) {

                this.sesion_serv.resetSesion();
                this.router.navigateByUrl('/pages/login');  

            }

        });
    }

    deleteUser() {
        
        Swal.fire({
          title: '¿Está seguro?',
          text: `Está seguro que desea eliminar su cuenta`,
          icon: 'question',
          showConfirmButton: true,
          showCancelButton: true
        }).then( resp => {

            if ( resp.value ) {

                this.eliminar();  

            }

        });
    }

    eliminar(){

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

        var that = this;

        this.api_serv.deleteQuery(`usuarios/destroy_cuenta/${ this.sesion_serv.getUserId() }`)
        .subscribe({
          next(data : any) {
            console.log(data);

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });

            
            that.sesion_serv.resetSesion();
            localStorage.removeItem('email');
            localStorage.removeItem('pass');
            localStorage.removeItem('aviso_privacidad');
            //localStorage.removeItem('terminos_condiciones');
            that.router.navigateByUrl('/pages/login');


          },
          error(msg) {
            console.log(msg);
            //console.log(msg.error.error);
            that.tratarError(msg);

          }
        });
                
    }

    tratarError(msg : any){
        //token invalido/ausente o token expiro
        if(msg.status == 400 || msg.status == 401){ 
          Swal.fire({
            title: 'Warning',
            text: msg.error.error,
            icon: 'warning'
          });

          //this.router.navigateByUrl('/login');
        }
        else { 
          Swal.fire({
            title: 'Error',
            text: msg.error.error,
            icon: 'error'
          });
        }

    }
}
