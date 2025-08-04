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
    selector: 'register-cmp',
    templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit{
    test : Date = new Date();

    flag_vista = 1;
    myForm: FormGroup;
    accion : any = null; //0=crear 1=editar

    niveles_estudio = [
        {nivel:'Bachillerato'},
        {nivel:'Profesional técnico'},
        {nivel:'Licienciatura'},
        {nivel:'Ingeniería'},
        {nivel:'Maestría'},
        {nivel:'Doctorado'},
    ]; 

    terminos_condiciones = false;
    aviso_privacidad = false;

    constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private _location: Location,
        private router: Router,
    ) { 

        this.crearFormulario();
        // this.crearListenersForm();

      if(localStorage.getItem('terminos_condiciones')){
        this.terminos_condiciones = true;
      }

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

        setTimeout(function(){
            // after 1000 ms we add the class animated to the login/register card
            $('.card').removeClass('card-hidden');
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

    crearFormulario() {

        this.myForm = this.fb.group({
            email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
            password  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
            password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],   
            nombre  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
            edad  : ['', [ Validators.required, Validators.min(1) ]  ],
            telefono  : ['', [ Validators.required, Validators.compose([Validators.minLength(10),Validators.maxLength(10)]), Validators.pattern('^[0-9]+$') ]  ],
            nivel_estudios  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
            institucion  : ['', [ Validators.required, Validators.maxLength(1000) ]  ],

        }); 
    
    }

    emailKeyup(){
        let minus = this.myForm.value.email;
        minus = minus.toString().toLowerCase();
        this.myForm.patchValue({email : minus});
    }

    cargarDataMyForm(){
        this.myForm.patchValue({email : ''});
        this.myForm.patchValue({password : ''});
        this.myForm.patchValue({password2 : ''});
        this.myForm.patchValue({nombre : ''});
        this.myForm.patchValue({edad : ''});
        this.myForm.patchValue({telefono : ''});
        this.myForm.patchValue({nivel_estudios : ''});
        this.myForm.patchValue({institucion : ''});

        Object.values( this.myForm.controls ).forEach( control => {
            
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsUntouched() );
          } else {
            control.markAsUntouched();
          }

        });
    }

    get emailNoValido() {
        return this.myForm.get('email').invalid && this.myForm.get('email').touched
    }

    get passwordNoValido() {
        return this.myForm.get('password').invalid && this.myForm.get('password').touched
    }

    get password2NoValido() {
        const password = this.myForm.get('password').value;
        const password2 = this.myForm.get('password2').value;

        return ( password === password2 ) ? false : true;
    }

    get nombreNoValido() {
        return this.myForm.get('nombre').invalid && this.myForm.get('nombre').touched
    }

    get edadNoValido() {
        return this.myForm.get('edad').invalid && this.myForm.get('edad').touched
    }

    get telefonoNoValido() {
        return this.myForm.get('telefono').invalid && this.myForm.get('telefono').touched
    }

    get nivel_estudiosNoValido() {
        return this.myForm.get('nivel_estudios').invalid && this.myForm.get('nivel_estudios').touched
    }

    get institucionNoValido() {
        return this.myForm.get('institucion').invalid && this.myForm.get('institucion').touched
    }

    guardar(): void {
        console.log( this.myForm );

        let password_valid = (this.myForm.value.password==this.myForm.value.password2)?true:false;

        if ( this.myForm.invalid || !password_valid) {

          if(this.myForm.get('email').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Ingresa tu email',
              icon: 'warning'
            });
          }else if(!password_valid){
            Swal.fire({
              title: 'Warning',
              text: 'Los passwords de usuario son diferentes',
              icon: 'warning'
            });
          }else if(this.myForm.get('nombre').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Ingresa tu nombre',
              icon: 'warning'
            });
          }else if(this.myForm.get('edad').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Ingresa tu edad',
              icon: 'warning'
            });
          }else if(this.myForm.get('telefono').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Ingresa tu número de teléfono',
              icon: 'warning'
            });
          }else if(this.myForm.get('nivel_estudios').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Selecciona tu nivel de estudios',
              icon: 'warning'
            });
          }else if(this.myForm.get('institucion').invalid){
            Swal.fire({
              title: 'Warning',
              text: 'Ingresa tu institucion de procedencia',
              icon: 'warning'
            });
          }

          return Object.values( this.myForm.controls ).forEach( control => {
            
            if ( control instanceof FormGroup ) {
              Object.values( control.controls ).forEach( control => control.markAsTouched() );
            } else {
              control.markAsTouched();
            }
     
          });
         
        }else{

          this.crear();
          
        }
    }

    crear(){

        Swal.fire({
          title: '¿Está seguro?',
          text: `Está seguro que desea crear el usuario`,
          icon: 'question',
          showConfirmButton: true,
          showCancelButton: true
        }).then( resp => {

            if ( resp.value ) {

                localStorage.setItem('terminos_condiciones', '1');
                localStorage.setItem('aviso_privacidad', '1');
   
                var datos= {
                  nombre  : this.myForm.value.nombre,
                  edad  : this.myForm.value.edad,
                  telefono  : this.myForm.value.telefono,
                  nivel_estudios  : this.myForm.value.nivel_estudios,
                  institucion  : this.myForm.value.institucion,
                  email  : this.myForm.value.email,
                  password  : this.myForm.value.password
                };

                Swal.fire({
                  title: 'Espere',
                  text: 'Ejecutando...',
                  icon: 'info',
                  allowOutsideClick: false
                });
                Swal.showLoading();

                var that = this;

                this.api_serv.postQuery('usuarios/crear_invitado', datos)
                .subscribe({
                  next(data : any) {
                    console.log(data);

                    Swal.fire({
                      title: 'Info',
                      text: data.message,
                      icon: 'info',
                    }); 

                    that.router.navigateByUrl('/pages/login');

                  },
                  error(msg) {
                    console.log(msg);
                    //console.log(msg.error.error);
                    that.tratarError(msg);

                  }
                });

            }

        });
                
    }

    aGuardar(){
        if(!this.terminos_condiciones){
          Swal.fire({
              //title: 'Info',
              text: 'Acepta los términos y condiciones',
              icon: 'info'
            });
        }else if(!this.aviso_privacidad){
          Swal.fire({
              //title: 'Info',
              text: 'Acepta el aviso de privacidad',
              icon: 'info'
            });
        }else{
          this.guardar();
        }
    }


}
