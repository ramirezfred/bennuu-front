import { Component, OnInit, ElementRef } from '@angular/core';

//Mis imports
import { APIService } from '../../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';

import { Location } from '@angular/common';


declare var $:any;

@Component({
    selector: 'email-password-cmp',
    templateUrl: './email-password.component.html'
})

export class EmailPasswordComponent implements OnInit{
    test : Date = new Date();

    myFormCrear: FormGroup;

    constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private _location: Location,
        private router: Router,
    ) { 

      this.crearFormCrear();

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

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
        }, 700)
    }

  Ingresar(){
    this.router.navigateByUrl('/pages/login');
  }

  goBack(){
      this._location.back();
  }

    tratarError(msg : any){
      //token invalido/ausente o token expiro
      if(msg.status == 400 || msg.status == 401 || msg.status == 404){ 
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

  crearFormCrear() {

    this.myFormCrear = this.fb.group({
      email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],

    });     
       
  }

  get emailNoValido() {
    return this.myFormCrear.get('email').invalid && this.myFormCrear.get('email').touched
  }

  register(){

    if ( this.myFormCrear.invalid) {

      if(this.myFormCrear.get('email').invalid){
        Swal.fire({
          title: 'Warning',
          text: 'Ingresa el email asociado a tu cuenta',
          icon: 'warning'
        });
      }

      return Object.values( this.myFormCrear.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

          this.Registrar();

    }
  }

  Registrar(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
   
    var datos= {
      email: this.myFormCrear.value.email,
    }

    var that = this;

    this.api_serv.postQuery(`usuarios/email_recover_password`, datos)
    .subscribe({
      next(data : any) {
           
        console.log(data);
  
        Swal.fire({
            title: 'Info',
            text: data.message,
            icon: 'info',
            showConfirmButton: true,
            //showCancelButton: true
            allowOutsideClick: false
          }).then( resp => {

              //if ( resp.value ) {
              if (resp.isConfirmed) {
    
                that.Ingresar();                

              }

          });

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }


}
