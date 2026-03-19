import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

//Mis imports
import { APIService } from '../services/API/API.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormGroupDirective, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { SesionService } from '../services/sesion/sesion.service';

//import { TableData } from '../../lbd/lbd-table/lbd-table.component';

import { DomSanitizer } from '@angular/platform-browser';

import { Location } from '@angular/common';



declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'admin-usuarios-cmp',
    templateUrl: 'admin-usuarios.component.html',
    styleUrls: ['./admin-usuarios.component.css'],
})


export class AdminUsuariosComponent implements OnInit, OnDestroy{
    
    private data:any;
    private datos:any;
    public loading = false;

    objAOperar = null;
    num_guia = null;

    bandera_init = null;

    curp = {
      curp : '',
      nombre : '',
      apellido1 : '',
      apellido2 : '',
      dia : '',
      mes : '',
      anio : '',
      sexo : '',
      estado : '',
    };

    validado = null;

    saldo_actual = null;
    password = null;
    abono = null;

    myFormCrear: FormGroup;
    @ViewChild('modalNewUser') modalNewUser : ElementRef;
    accion : any = null; //0=crear 1=editar

    comision = null;
    comision2 = null;
    tipo_comision = null;
    tipo_comision2 = null;

    @ViewChild('fileInputArchivo') fileInputArchivo : ElementRef;
    flag_archivo = null;
    public archivos: any = [];

    archivo = {
      id : null,
      usuario_id : null,
      ine : null,
      csf : null,
      cd : null,
      contrato : null,
    };

    paqueteria = {
      id : null,
      usuario_id : null,
      tipo : null,
      Estafeta : false,
      RedPack : false,
      _99Minutos : false,
      AmPm : false,
      PaqueteExpress : false,
      FedEx : false,
      JTExpress : false,
      DHL : false,
      TresGuerras : false,
    };

    public listado: any = [];

    public page: number = 0;
    public currentPage: number = 0;
    public search: string = '';
    public filter_model: string = 'User';

    alls_apis_flag = false;
    all_api5_flag = false;
    all_api7_flag = false;
    all_api8_flag = false;
    all_api4_flag = false;

    paqueterias: any = [
      {
        "usuario_id": null,
        "api": 5,
        "tipo": null,
        "Estafeta": false,
        "RedPack": false,
        "_99Minutos": false,
        "AmPm": false,
        "PaqueteExpress": false,
        "FedEx": false,
        "JTExpress": false,
        "DHL": false,
        "TresGuerras": false
      },
      {
        "usuario_id": null,
        "api": 7,
        "tipo": null,
        "PaqueteExpress": false
      },
      {
        "usuario_id": null,
        "api": 8,
        "tipo": null,
        "Estafeta": false,
        "FedEx": false,
        "DHL": false
      },
      {
        "usuario_id": null,
        "api": 4,
        "tipo": null,
        "Estafeta": false,
        "_99Minutos": false,
        "PaqueteExpress": false,
        "FedEx": false,
        "DHL": false,
        "TresGuerras": false
      }
    ];

    @ViewChild('txtSearch') txtSearch! : ElementRef;

    constructor(
        private api_serv: APIService,
        private http: HttpClient,
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private sesion_serv: SesionService,
        private _location: Location,
    )
    {
      
      this.crearFormCrear(0);
    }

  ngOnInit(){

    this.getListado();
   
  }

  ngOnDestroy() {
    // acciones de destrucción
    this.closeModal('#modalValidar');
    this.closeModal('#modalSaldo');
    this.closeModal('#modalNewUser');
    this.closeModal('#modalComision');
    this.closeModal('#modalArchivos');
    this.closeModal('#modalPaqueterias');
  }

  ngAfterViewInit(){

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

  goBack(){
      this._location.back();
  }

  scroll_to(id_scroll_to): void {

      setTimeout(()=>{
          
        // Hack: Scrolls to top of Page after page view initialized
        let id_scroll = document.getElementById(id_scroll_to);
        if (id_scroll !== null) {
          id_scroll.scrollIntoView();
          id_scroll = null;
        }  

      },350);
  }

  openModal(modal_id){
    $(modal_id).modal('show');
  }

  closeModal(modal_id){
    $(modal_id).modal('hide');
  }

  closeAllModals(){
    this.closeModal('#modalValidar');
    this.closeModal('#modalSaldo');
    this.closeModal('#modalNewUser');
    this.closeModal('#modalComision');
    this.closeModal('#modalArchivos');
    this.closeModal('#modalPaqueterias');
  }

  nextPage(){
    this.page += 5;
    this.currentPage += 1; 
  }

  prevPage(){
    if( this.page > 0 ){
      this.page -= 5;
      this.currentPage -= 1;
    }
  }

  onSearchModel( search: string ){
    this.page = 0;
    this.search = search;
  }

  getListado(): void {

    this.listado = [];

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
  
    var datos = {};
    
    var that = this;

    this.api_serv.getQuery(`usuarios/clientes`)
    .subscribe({
      next(data : any) {
        console.log(data);

        that.listado = data.clientes;

        for(var i = 0; i < data.clientes.length; i++){
          that.listado[i].status = (data.clientes[i].status == '1') ? true : false;
        }
        
        Swal.close ();

        if(that.listado.length > 0){
          that.currentPage = 1;
        }

        that.txtSearch.nativeElement.value = '';
        that.onSearchModel('');

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  aValidar(obj): void {
    this.objAOperar = obj;
    if(this.objAOperar.validado == 'Si'){
      this.validado = true;
    }
    if(this.objAOperar.validado == 'No'){
      this.validado = false;
    }
    this.getCurp(this.objAOperar.id);
  }

  getCurp(usuario_id): void {

    this.curp = {
      curp : '',
      nombre : '',
      apellido1 : '',
      apellido2 : '',
      dia : '',
      mes : '',
      anio : '',
      sexo : '',
      estado : '',
    }

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.loading = true;
    //this.showToast('info', 'Info!', 'Consultando...');
    
    var that = this;

    this.api_serv.getQuery(`curp/${usuario_id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        if(data.curp){
          that.curp = data.curp;
        }  

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });
        that.loading = false;

        that.openModal('#modalValidar');   

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  ChangeValidado(valor){
    //console.log(valor);
    //console.log(this.validado);
    this.setValidado();
  }

  setValidado(){

    let validado_aux = null;

    if(!this.validado){
      validado_aux = 0;
    }else if(this.validado){
      validado_aux = 1;
    }

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.loading = true;
    
    var datos = {
      validado : validado_aux,
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/validado/${this.objAOperar.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false;

        if(!that.validado){
          that.objAOperar.validado = 'No';
        }else if(that.validado){
          that.objAOperar.validado = 'Si';
        }
         
        //that.objAOperar = null;
        //that.num_guia = null;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  ChangeStatus(obj){
    this.setStatus(obj);
  }

  setStatus(obj){

    let status_aux = obj.status ? 1 : 0;

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      status : status_aux,
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/status/${obj.id}`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false;
         
        //that.objAOperar = null;
        //that.num_guia = null;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  aRecargar(obj): void {
    this.objAOperar = obj;
    this.saldo_actual = this.objAOperar.saldo;
    this.password = null;
    this.abono = null;

    this.closeAllModals();
    setTimeout(()=>{
      this.openModal('#modalSaldo');
    },60);

    
  }

  recargarSaldo(){

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      usuario_id : this.objAOperar.id,
      saldo : this.abono,
      pass_config : this.password,
    };

    var that = this;

    this.api_serv.postQuery(`usuarios/recargar/saldo`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false;
         
        that.objAOperar.saldo = data.saldo
        that.objAOperar = null;
        //that.num_guia = null;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  aCrear(): void {
    this.crearFormCrear(0);

    
    this.closeAllModals();
    setTimeout(()=>{
      this.openModal('#modalNewUser');
    },60);
  }

  //accion 0=crear 1=editar
  crearFormCrear(accion : number = 0) {

    this.accion = accion;
    if(accion == 0){
      this.myFormCrear = this.fb.group({
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        //nombre  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        //telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
        terminos  : [false],
        password  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
      }); 
    }else{
      this.myFormCrear = this.fb.group({
        email  : ['', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        //nombre  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        //telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
        terminos  : [false],
        password  : ['', [ Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.maxLength(50) ]  ],
      });
    }
        
       
  }

  cargarDataFormCrear(){
    this.myFormCrear.patchValue({email : ''});
    //this.myFormCrear.patchValue({telefono : ''});
    this.myFormCrear.patchValue({password : ''});
    this.myFormCrear.patchValue({password2 : ''});

    Object.values( this.myFormCrear.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });
  }

  get emailNoValido() {
    return this.myFormCrear.get('email').invalid && this.myFormCrear.get('email').touched
  }

  // get telefonoNoValido() {
  //   return this.myFormCrear.get('telefono').invalid && this.myFormCrear.get('telefono').touched
  // }

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

      if(this.myFormCrear.get('email').invalid){
        Swal.fire({
          title: 'warning',
          text: 'Ingresa el email',
          icon: 'warning',
        }); 
      }else if(!password_valid){
        Swal.fire({
          title: 'warning',
          text: 'Los passwords no coinciden',
          icon: 'warning',
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

      if (this.accion == 0) {
        this.Registrar();
      }else if (this.accion == 1) {
        this.editar();
      }

    }
  }

  Registrar(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea crear el usuario`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        this.loading = false;
       
        var datos= {
          email: this.myFormCrear.value.email,
          //telefono: this.myFormCrear.value.telefono,
          password: this.myFormCrear.value.password,
        }

        var that = this;

        this.api_serv.postQuery(`usuarios`, datos)
        .subscribe({
          next(data : any) {
               
            console.log(data);
            that.data=data;
            
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 
            that.loading = false;

            //para cerrar la modal
            // let click_event = new CustomEvent('click');
            // let btn_element = document.querySelector('#btnAtras');
            // btn_element.dispatchEvent(click_event);
            that.closeModal('#modalNewUser');

            that.cargarDataFormCrear();

            that.getListado();

          },
          error(msg) {
            console.log(msg);
            that.loading = false;
            that.tratarError(msg);
          }
        });

      }

    });

  }

  // aSetComision(obj): void {
  //   this.objAOperar = obj;
  //   this.password = null;
  //   this.comision = this.objAOperar.comision;

  //   this.closeAllModals();
  //   setTimeout(()=>{
  //     this.openModal('#modalComision');
  //   },60);
  // }

  // setComision(){

  //   Swal.fire({
  //     title: 'Espere',
  //     text: 'Ejecutando',
  //     icon: 'info',
  //     allowOutsideClick: false
  //   });
  //   Swal.showLoading();
  //   this.loading = true;
    
  //   var datos = {
  //     comision : this.comision,
  //     pass_config : this.password,
  //   };

  //   var that = this;

  //   this.api_serv.putQuery(`usuarios/comision/ ${ this.objAOperar.id }`, datos)
  //   .subscribe({
  //     next(data : any) {
  //       console.log(data);

  //       Swal.fire({
  //         title: 'Info',
  //         text: data.message,
  //         icon: 'info',
  //       }); 
  //       that.loading = false;
         
  //       that.objAOperar.comision = that.comision;
  //       that.objAOperar = null;
  //       //that.num_guia = null;

  //     },
  //     error(msg) {
  //       console.log(msg);
  //       that.loading = false;
  //       that.tratarError(msg);
  //     }
  //   });
  // }

  // async aSetComision(obj) {
  //   this.objAOperar = obj;
  //   this.password = null;
  //   this.comision = this.objAOperar.comision;
  
  //   const { value: formValues } = await Swal.fire({
  //     title: "Comisión Sobre/Caja",
  //     html:
  //       '<input id="swal-input-a1" type="password" class="form-control" placeholder="Password" autocomplete="new-password" name="new-password"><br>' +
  //       '<input id="swal-input-a2" type="number" class="form-control" placeholder="Monto" min="0" autocomplete="off" name="new-number" value="' + this.comision + '"><br>',
  //     focusConfirm: false,
  //     showConfirmButton: true,
  //     showCancelButton: true,
  //     preConfirm: () => {
  //       const password = (document.getElementById('swal-input-a1') as HTMLInputElement).value;
  //       const number = (document.getElementById('swal-input-a2') as HTMLInputElement).value;
  //       if (!password || !number) {
  //         Swal.showValidationMessage(`Por favor, ingrese ambos campos`);
  //       }
  //       return { password: password, number: number };
  //     }
  //   });
  
  //   if (formValues) {
  //     //Swal.fire(`Password: ${formValues.password}, Monto: ${formValues.number}`);
  //     this.setComision(formValues.password,formValues.number)
  //   }
  // }

  async aSetComision(obj) {
    this.objAOperar = obj;
    this.password = null;
    this.comision = this.objAOperar.comision;
    this.tipo_comision = this.objAOperar.tipo_comision; // valor por defecto

    const { value: formValues } = await Swal.fire({
      title: "Comisión Sobre/Caja",
      html: `
        <input id="swal-input-pass" type="password" class="form-control" placeholder="Password" autocomplete="new-password" name="new-password"><br>
        
        <div style="text-align:left;">
          <label>
            <input type="radio" name="tipo_comision" value="adicional" ${this.tipo_comision === 'adicional' ? 'checked' : ''}>
            Adicional
          </label><br>
          <label>
            <input type="radio" name="tipo_comision" value="porcentaje" ${this.tipo_comision === 'porcentaje' ? 'checked' : ''}>
            Porcentaje (%)
          </label><br>
          <label>
            <input type="radio" name="tipo_comision" value="fijo" ${this.tipo_comision === 'fijo' ? 'checked' : ''}>
            Precio fijo
          </label>
        </div>
        <br>
        <input id="swal-input-monto" type="number" class="form-control" placeholder="Monto o %" autocomplete="off" name="new-number" value="${this.comision}" min="0" step="0.01">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const password = (document.getElementById('swal-input-pass') as HTMLInputElement).value;
        const monto = (document.getElementById('swal-input-monto') as HTMLInputElement).value;
        const tipoRadio = document.querySelector('input[name="tipo_comision"]:checked') as HTMLInputElement;

        if (!password || !monto || !tipoRadio) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return;
        }

        return {
          password: password,
          tipo: tipoRadio.value,
          valor: parseFloat(monto)
        };
      }
    });

    if (formValues) {
      // Puedes enviar esto al backend según el tipo seleccionado
      console.log('Comisión seleccionada:', formValues);
      this.setComision(formValues.password, formValues.valor, formValues.tipo);
    }
  }


  setComision(password,comision,tipo){

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      comision : comision,
      pass_config : password,
      tipo_comision : tipo
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/comision/ ${ this.objAOperar.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false;
         
        that.objAOperar.comision = comision;
        that.objAOperar.tipo_comision = tipo;
        that.objAOperar = null;
        //that.num_guia = null;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  async aSetComision2(obj) {
    this.objAOperar = obj;
    this.password = null;
    this.comision2 = this.objAOperar.comision2;
    this.tipo_comision2 = this.objAOperar.tipo_comision2;

    const { value: formValues } = await Swal.fire({
      title: "Comisión Pallet",
      html: `
        <input id="swal-input-pass" type="password" class="form-control" placeholder="Password" autocomplete="new-password" name="new-password"><br>
        
        <div style="text-align:left;">
          <label>
            <input type="radio" name="tipo_comision" value="adicional" ${this.tipo_comision2 === 'adicional' ? 'checked' : ''}>
            Adicional
          </label><br>
          <label>
            <input type="radio" name="tipo_comision" value="porcentaje" ${this.tipo_comision2 === 'porcentaje' ? 'checked' : ''}>
            Porcentaje (%)
          </label><br>
          <label>
            <input type="radio" name="tipo_comision" value="fijo" ${this.tipo_comision2 === 'fijo' ? 'checked' : ''}>
            Precio fijo
          </label>
        </div>
        <br>
        <input id="swal-input-monto" type="number" class="form-control" placeholder="Monto o %" autocomplete="off" name="new-number" value="${this.comision2}" min="0" step="0.01">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const password = (document.getElementById('swal-input-pass') as HTMLInputElement).value;
        const monto = (document.getElementById('swal-input-monto') as HTMLInputElement).value;
        const tipoRadio = document.querySelector('input[name="tipo_comision"]:checked') as HTMLInputElement;

        if (!password || !monto || !tipoRadio) {
          Swal.showValidationMessage("Todos los campos son obligatorios");
          return;
        }

        return {
          password: password,
          tipo: tipoRadio.value,
          valor: parseFloat(monto)
        };
      }
    });

    if (formValues) {
      // Puedes enviar esto al backend según el tipo seleccionado
      console.log('Comisión seleccionada:', formValues);
      this.setComision2(formValues.password, formValues.valor, formValues.tipo);
    }
  }

  setComision2(password,comision2, tipo){

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      comision2 : comision2,
      pass_config : password,
      tipo_comision2 : tipo
    };

    var that = this;

    this.api_serv.putQuery(`usuarios/comision/ ${ this.objAOperar.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false;
         
        that.objAOperar.comision2 = comision2;
        that.objAOperar.tipo_comision2 = tipo;
        that.objAOperar = null;
        //that.num_guia = null;

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  aSetArchivo(obj): void {
    this.objAOperar = obj;
    this.getArchivos(this.objAOperar.id);
  }

  getArchivos(usuario_id): void {

    this.archivo = {
      id : null,
      usuario_id : null,
      ine : null,
      csf : null,
      cd : null,
      contrato : null,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`usuarios/get_archivos/${usuario_id}`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.archivo = data.archivo;
        that.loading = false;    

        Swal.close ();
        
        that.closeAllModals();
        setTimeout(()=>{
          that.openModal('#modalArchivos');
        },60);

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  cargarArchivo(flag){
    this.flag_archivo = flag;
    this.fileInputArchivo.nativeElement.click();
  }

  capturarFileArchivo(event : any): any {
    const archivoCapturado = event.target.files[0];

    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    setTimeout(()=>{
      this.subirArchivo();
    },200);
  }

  /**
   * Limpiar archivo
  */
  clearArchivo(): any {
    this.archivos = [];
  }

  /**
   * Subir archivo
  */
  subirArchivo(): any {
    try {
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        //formularioDeDatos.append('token', this.token_internow); 
        formularioDeDatos.append('archivo', this.archivos[0]);        
        //formularioDeDatos.append('ext', ext);  

        Swal.fire({
          title: 'Espere',
          text: 'Subiendo archivo...',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();
        this.loading = true;   

        var that = this;
      
        this.api_serv.postQueryUpload(`usuarios/store_archivos/${ this.archivo.id }/${ this.flag_archivo }`, formularioDeDatos)
        .subscribe({
          next(data : any) {
            //console.log(data);
            console.log('Respuesta del servidor', data);
            
            if(that.flag_archivo == 1){
              that.archivo.ine = data.url;
            }else if(that.flag_archivo == 2){
              that.archivo.csf = data.url;
            }else if(that.flag_archivo == 3){
              that.archivo.cd = data.url;
            }else if(that.flag_archivo == 4){
              that.archivo.contrato = data.url;
            }

            that.fileInputArchivo.nativeElement.value = '';

            that.clearArchivo();

            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            });    
            that.loading = false;
            
          },
          error(msg) {
            console.log(msg);
            that.loading = false;
            that.tratarError(msg);
    
          }
        });

      }else{

        Swal.fire({
          title: 'Warning',
          text: 'Seleccione un archivo',
          icon: 'warning',
        });  

      }

    } catch (e) {
      console.log('ERROR', e);
      Swal.fire({
        title: 'Warning',
        text: 'Error al intentar cargar el archivo',
        icon: 'warning',
      });  


    }
  }

  descargarArchivo(url): any {
    window.open(url, '_blank');
  }

  aSetPaqueteria(obj,tipo): void {
    this.objAOperar = obj;
    this.getPaqueterias(this.objAOperar.id,tipo);
  }

  getPaqueterias(usuario_id,tipo): void {

    this.alls_apis_flag = false;
    this.all_api5_flag = false;
    this.all_api7_flag = false;
    this.all_api8_flag = false;
    this.all_api4_flag = false;

    this.paqueterias = [
      {
        "usuario_id": null,
        "api": 5,
        "tipo": null,
        "Estafeta": false,
        "RedPack": false,
        "_99Minutos": false,
        "AmPm": false,
        "PaqueteExpress": false,
        "FedEx": false,
        "JTExpress": false,
        "DHL": false,
        "TresGuerras": false
      },
      {
        "usuario_id": null,
        "api": 7,
        "tipo": null,
        "PaqueteExpress": false
      },
      {
        "usuario_id": null,
        "api": 8,
        "tipo": null,
        "Estafeta": false,
        "FedEx": false,
        "DHL": false
      },
      {
        "usuario_id": null,
        "api": 4,
        "tipo": null,
        "Estafeta": false,
        "_99Minutos": false,
        "PaqueteExpress": false,
        "FedEx": false,
        "DHL": false,
        "TresGuerras": false
      }
    ];

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`usuarios/get_paqueterias/${usuario_id}?tipo=${tipo}`)
    .subscribe({
      next(data : any) {
        console.log(data);

        for (let i = 0; i < that.paqueterias.length; i++) {
          that.paqueterias[i].tipo = tipo;
          that.paqueterias[i].usuario_id = usuario_id;
        }

        let datos = data.data;

        for (let i = 0; i < datos.length; i++) {
          
          //Teiker
          if(datos[i].api == 5){
            that.paqueterias[0].Estafeta = (datos[i].Estafeta == 1) ? true : false;
            that.paqueterias[0].RedPack = (datos[i].RedPack == 1) ? true : false;
            that.paqueterias[0]._99Minutos = (datos[i]._99Minutos == 1) ? true : false;
            that.paqueterias[0].PaqueteExpress = (datos[i].PaqueteExpress == 1) ? true : false;
            that.paqueterias[0].FedEx = (datos[i].FedEx == 1) ? true : false;
            that.paqueterias[0].JTExpress = (datos[i].JTExpress == 1) ? true : false;
            that.paqueterias[0].DHL = (datos[i].DHL == 1) ? true : false;
            that.paqueterias[0].TresGuerras = (datos[i].TresGuerras == 1) ? true : false;
          }
          //CargoMart
          else if(datos[i].api == 7){
            that.paqueterias[1].PaqueteExpress = (datos[i].PaqueteExpress == 1) ? true : false;
          }
          //Manuable
          else if(datos[i].api == 8){
            that.paqueterias[2].Estafeta = (datos[i].Estafeta == 1) ? true : false;
            that.paqueterias[2].FedEx = (datos[i].FedEx == 1) ? true : false;
            that.paqueterias[2].DHL = (datos[i].DHL == 1) ? true : false;
          }
          //Pak2Go
          else if(datos[i].api == 4){
            that.paqueterias[3].Estafeta = (datos[i].Estafeta == 1) ? true : false;
            that.paqueterias[3]._99Minutos = (datos[i]._99Minutos == 1) ? true : false;
            that.paqueterias[3].PaqueteExpress = (datos[i].PaqueteExpress == 1) ? true : false;
            that.paqueterias[3].FedEx = (datos[i].FedEx == 1) ? true : false;
            that.paqueterias[3].DHL = (datos[i].DHL == 1) ? true : false;
            that.paqueterias[3].TresGuerras = (datos[i].TresGuerras == 1) ? true : false;
          }
          
        }

        that.checarSelecciones();

        that.loading = false;   

        Swal.close ();
         
        that.closeAllModals();
        setTimeout(()=>{
          that.openModal('#modalPaqueterias');
        },60);

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  checarSelecciones(){
    if(
      !this.paqueterias[0].Estafeta ||
      !this.paqueterias[0].RedPack ||
      !this.paqueterias[0]._99Minutos ||
      !this.paqueterias[0].PaqueteExpress ||
      !this.paqueterias[0].FedEx ||
      !this.paqueterias[0].JTExpress ||
      !this.paqueterias[0].DHL ||
      !this.paqueterias[0].TresGuerras 
    ){
      this.all_api5_flag = false;
    }else{
      this.all_api5_flag = true;
    }

    if(
      !this.paqueterias[1].PaqueteExpress 
    ){
      this.all_api7_flag = false;
    }else{
      this.all_api7_flag = true;
    }

    if(
      !this.paqueterias[2].Estafeta ||
      !this.paqueterias[2].FedEx ||
      !this.paqueterias[2].DHL 
    ){
      this.all_api8_flag = false;
    }else{
      this.all_api8_flag = true;
    }

    if(
      !this.paqueterias[3].Estafeta ||
      !this.paqueterias[3]._99Minutos ||
      !this.paqueterias[3].PaqueteExpress ||
      !this.paqueterias[3].FedEx ||
      !this.paqueterias[3].DHL ||
      !this.paqueterias[3].TresGuerras     
    ){
      this.all_api4_flag = false;
    }else{
      this.all_api4_flag = true;
    }

    if(
      !this.all_api5_flag ||
      !this.all_api7_flag ||
      !this.all_api8_flag ||
      !this.all_api4_flag
    ){
      this.alls_apis_flag = false;
    }else{
      this.alls_apis_flag = true;
    }
  }

  ChangeAllApis(){

    this.all_api5_flag = this.alls_apis_flag;
    this.all_api7_flag = this.alls_apis_flag;
    this.all_api8_flag = this.alls_apis_flag;
    this.all_api4_flag = this.alls_apis_flag;

    this.ChangeApi(5);
    this.ChangeApi(7);
    this.ChangeApi(8);
    this.ChangeApi(4);

  }

  ChangeApi(api){

    if(api == 5){
      this.paqueterias[0].Estafeta = this.all_api5_flag;
      this.paqueterias[0].RedPack = this.all_api5_flag;
      this.paqueterias[0]._99Minutos = this.all_api5_flag;
      this.paqueterias[0].PaqueteExpress = this.all_api5_flag;
      this.paqueterias[0].FedEx = this.all_api5_flag;
      this.paqueterias[0].JTExpress = this.all_api5_flag;
      this.paqueterias[0].DHL = this.all_api5_flag;
      this.paqueterias[0].TresGuerras = this.all_api5_flag;
    }else if(api == 7){
      this.paqueterias[1].PaqueteExpress = this.all_api7_flag;
    }else if(api == 8){
      this.paqueterias[2].Estafeta = this.all_api8_flag;
      this.paqueterias[2].FedEx = this.all_api8_flag;
      this.paqueterias[2].DHL = this.all_api8_flag;
    }else if(api == 4){
      this.paqueterias[3].Estafeta = this.all_api4_flag;
      this.paqueterias[3]._99Minutos = this.all_api4_flag;
      this.paqueterias[3].PaqueteExpress = this.all_api4_flag;
      this.paqueterias[3].FedEx = this.all_api4_flag;
      this.paqueterias[3].DHL = this.all_api4_flag;
      this.paqueterias[3].TresGuerras = this.all_api4_flag;
    }

    if(
      !this.all_api5_flag ||
      !this.all_api7_flag ||
      !this.all_api8_flag ||
      !this.all_api4_flag
    ){
      this.alls_apis_flag = false;
    }else{
      this.alls_apis_flag = true;
    }

  }

  ChangeStatusPaqueteria(proveedor): void {
    console.log(proveedor);

    this.checarSelecciones();
  }

  setPaqueterias(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea editar las paqueterías del usuario`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        var datos = JSON.parse(JSON.stringify(this.paqueterias));
       
        datos[0].Estafeta = (datos[0].Estafeta) ? 1 : 0;
        datos[0].RedPack = (datos[0].RedPack) ? 1 : 0;
        datos[0]._99Minutos = (datos[0]._99Minutos) ? 1 : 0;
        datos[0].AmPm = (datos[0].AmPm) ? 1 : 0;
        datos[0].PaqueteExpress = (datos[0].PaqueteExpress) ? 1 : 0;
        datos[0].FedEx = (datos[0].FedEx) ? 1 : 0;
        datos[0].JTExpress = (datos[0].JTExpress) ? 1 : 0;
        datos[0].DHL = (datos[0].DHL) ? 1 : 0;
        datos[0].TresGuerras = (datos[0].TresGuerras) ? 1 : 0;

        datos[1].Estafeta = (datos[1].Estafeta) ? 1 : 0;
        datos[1].RedPack = (datos[1].RedPack) ? 1 : 0;
        datos[1]._99Minutos = (datos[1]._99Minutos) ? 1 : 0;
        datos[1].AmPm = (datos[1].AmPm) ? 1 : 0;
        datos[1].PaqueteExpress = (datos[1].PaqueteExpress) ? 1 : 0;
        datos[1].FedEx = (datos[1].FedEx) ? 1 : 0;
        datos[1].JTExpress = (datos[1].JTExpress) ? 1 : 0;
        datos[1].DHL = (datos[1].DHL) ? 1 : 0;
        datos[1].TresGuerras = (datos[1].TresGuerras) ? 1 : 0;

        datos[2].Estafeta = (datos[2].Estafeta) ? 1 : 0;
        datos[2].RedPack = (datos[2].RedPack) ? 1 : 0;
        datos[2]._99Minutos = (datos[2]._99Minutos) ? 1 : 0;
        datos[2].AmPm = (datos[2].AmPm) ? 1 : 0;
        datos[2].PaqueteExpress = (datos[2].PaqueteExpress) ? 1 : 0;
        datos[2].FedEx = (datos[2].FedEx) ? 1 : 0;
        datos[2].JTExpress = (datos[2].JTExpress) ? 1 : 0;
        datos[2].DHL = (datos[2].DHL) ? 1 : 0;
        datos[2].TresGuerras = (datos[2].TresGuerras) ? 1 : 0;

        datos[3].Estafeta = (datos[3].Estafeta) ? 1 : 0;
        datos[3].RedPack = (datos[3].RedPack) ? 1 : 0;
        datos[3]._99Minutos = (datos[3]._99Minutos) ? 1 : 0;
        datos[3].AmPm = (datos[3].AmPm) ? 1 : 0;
        datos[3].PaqueteExpress = (datos[3].PaqueteExpress) ? 1 : 0;
        datos[3].FedEx = (datos[3].FedEx) ? 1 : 0;
        datos[3].JTExpress = (datos[3].JTExpress) ? 1 : 0;
        datos[3].DHL = (datos[3].DHL) ? 1 : 0;
        datos[3].TresGuerras = (datos[3].TresGuerras) ? 1 : 0;

        var that = this;

        this.api_serv.putQuery(`usuarios/update_paqueterias`, datos)
        .subscribe({
          next(data : any) {
               
            console.log(data);
            
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 

            that.closeModal('#modalPaqueterias');

            that.objAOperar = null;

          },
          error(msg) {
            console.log(msg);
            that.tratarError(msg);
          }
        });

      }

    });

  }

  aEditar(obj): void {
    this.crearFormCrear(1);

    this.objAOperar = obj;

    this.myFormCrear.patchValue({nombre : this.objAOperar.nombre});
    //this.myFormCrear.patchValue({telefono : this.objAOperar.telefono});
    this.myFormCrear.patchValue({email : this.objAOperar.email});
    this.myFormCrear.patchValue({password : ''});
    this.myFormCrear.patchValue({password2 : ''});

    this.closeAllModals();
    setTimeout(()=>{
      this.openModal('#modalNewUser');
    },60);
    
  }

  editar(): void {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Realmente desea editar el usuario`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        this.loading = false;
       
        var datos= {
          email: this.myFormCrear.value.email,
          //telefono: this.myFormCrear.value.telefono,
          password: this.myFormCrear.value.password,
        }

        var that = this;

        this.api_serv.putQuery(`usuarios/usuario/${ this.objAOperar.id }`, datos)
        .subscribe({
          next(data : any) {
               
            console.log(data);
            that.data=data;
            
            Swal.fire({
              title: 'Info',
              text: data.message,
              icon: 'info',
            }); 
            that.loading = false;

            that.closeModal('#modalNewUser');


            //that.getListado();
            that.objAOperar.email = that.myFormCrear.value.email;
            that.objAOperar = null;

          },
          error(msg) {
            console.log(msg);
            that.loading = false;
            that.tratarError(msg);
          }
        });

      }

    });

  }

  

 


}
