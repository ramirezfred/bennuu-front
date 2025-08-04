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
    selector: 'recover-password-cmp',
    templateUrl: './recover-password.component.html'
})

export class RecoverPasswordComponent implements OnInit{
    test : Date = new Date();

    myFormCrear: FormGroup;

    token = null;

    constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private _location: Location,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { 

      this.crearFormCrear();

      this.activatedRoute.params.subscribe( params => {
        console.log( params['token'] );

        this.token = params['token'];

      });

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
      password  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
      password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
    });     
       
  }

  get passwordNoValido() {
      return this.myFormCrear.get('password').invalid && this.myFormCrear.get('password').touched
  }

  get password2NoValido() {
      const password = this.myFormCrear.get('password').value;
      const password2 = this.myFormCrear.get('password2').value;

      return ( password === password2 ) ? false : true;
  }

  register(){

    let password_valid = (this.myFormCrear.value.password==this.myFormCrear.value.password2)?true:false;

    if ( this.myFormCrear.invalid || !password_valid) {

      if(!password_valid){
        Swal.fire({
          title: 'Warning',
          text: 'Los passwords no coinciden',
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
      password: this.myFormCrear.value.password,
    }

    var that = this;

    this.api_serv.putQuery2(`usuarios/update_password`, datos, this.token)
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
