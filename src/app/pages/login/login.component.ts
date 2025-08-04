import { Component, OnInit, ElementRef } from '@angular/core';

//Mis imports
import { HttpClient } from '@angular/common/http';
import { APIService } from '../../services/API/API.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SesionService } from '../../services/sesion/sesion.service';

declare var $:any;

@Component({
    selector: 'login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit{

    // email= 'dev.jhondoe.ve@gmail.com'
    // password='19931772';
    email= ''
    password='';
    private data:any;
    public loading = false;
    submitted = false;

    recordarme = true;

    test : Date = new Date();

    terminos_condiciones = false;
    aviso_privacidad = false;

    show = false;

    constructor(private http: HttpClient,
              private api_serv: APIService,
              private router: Router,
              private sesion_serv: SesionService,
              private activatedRoute: ActivatedRoute,
    )
    {

      localStorage.setItem('ruta_login', '1');

      if(localStorage.getItem('email')){
        this.email = localStorage.getItem('email');
      }
      if(localStorage.getItem('pass')){
        this.password = localStorage.getItem('pass');
      }

      // if(localStorage.getItem('terminos_condiciones')){
      //   this.terminos_condiciones = true;
      // }

      if(localStorage.getItem('aviso_privacidad')){
        this.aviso_privacidad = true;
      }

      

    }

    checkFullPageBackgroundImage(){
        var $page = $('.full-page');
        var image_src = $page.data('image');

        if(image_src !== undefined){
            var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    };

    ngOnInit(){
        this.checkFullPageBackgroundImage();

        var that = this;

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');

            that.show = true;
        }, 700)
    }

  aviso_privacidadSel(){
    this.aviso_privacidad = !this.aviso_privacidad;
  }

  terminos_condicionesSel(){
    this.terminos_condiciones = !this.terminos_condiciones;
  }

  TerminosCondiciones(){
    this.router.navigateByUrl('/pages-simples/terminos-condiciones');
  }

  AvisoPrivacidad(){
    this.router.navigateByUrl('/pages-simples/aviso-privacidad');
  }

  Register(){
    this.router.navigateByUrl('/pages-simples/register');
  }

  irEmailPass(){
    this.router.navigateByUrl('/pages-simples/email-password');
  }

  aIngresar(){
    /*if(!this.terminos_condiciones){
      Swal.fire({
          //title: 'Info',
          text: 'Acepta los términos y condiciones',
          icon: 'info'
        });
    }else*/ if(!this.aviso_privacidad){
      Swal.fire({
          //title: 'Info',
          text: 'Acepta el aviso de privacidad',
          icon: 'info'
        });
    }else{
      this.Ingresar();
    }
  }

  Ingresar(){

    //localStorage.setItem('terminos_condiciones', '1');
    localStorage.setItem('aviso_privacidad', '1');

    this.loading = true;
    this.submitted = true;
   
    var datos= {
      email: this.email,
      password: this.password
    };
    
    

    Swal.fire({
      title: 'Espere',
      text: 'Ingresando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery('login/web', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.api_serv.setToken(data.access_token, data.expires_in);
        /* Swal.close ();
        that.router.navigateByUrl('/dashboard'); */

        if ( that.recordarme ) {
          localStorage.setItem('email', that.email);
          localStorage.setItem('pass', that.password);
        }

        if (data.user.id) {
          //admin
          if (data.user.tipo_usuario == 1) {
            that.api_serv.setToken(data.token, null);
            that.sesion_serv.setUser(data.user);
            that.router.navigateByUrl('/dashboard');
            //this.router.navigate(['pages']);
            Swal.close ();

            // Swal.fire({
            //   //title: 'Info',
            //   text: 'En construcción para admin',
            //   icon: 'info'
            // });
          }
          //cliente
          else if (data.user.tipo_usuario == 2) {
            that.api_serv.setToken(data.token, null);
            that.sesion_serv.setUser(data.user);
            //that.router.navigateByUrl('/pages/nuevo-envio');
            that.router.navigateByUrl('/dashboard');
            //this.router.navigate(['pages']);
            Swal.close ();
          }
          else {

            Swal.fire({
              title: 'Error',
              text: 'Usuario no autorizado',
              icon: 'error'
            });
          }
        }else{

          Swal.fire({
              title: 'Error',
              text: 'Error al autenticar usuario',
              icon: 'error'
            });
        }

      },
      error(msg) {
        console.log(msg);

        Swal.fire({
          title: 'Error',
          text: msg.error.error,
          icon: 'error'
        });

      }
    });

  }

  
}
