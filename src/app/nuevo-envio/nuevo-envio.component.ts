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

declare var Conekta: any;

declare let paypal: any;

declare var $:any;

declare interface DataTable {
    headerRow: string[];
    //footerRow: string[];
    dataRows: any[];
}


@Component({
    selector: 'nuevo-envio-cmp',
    templateUrl: 'nuevo-envio.component.html',
    styleUrls: ['./nuevo-envio.component.css'],
})


export class NuevoEnvioComponent implements OnInit, OnDestroy{
    
  private data:any;
  private datos:any;
  public loading = false;

  cotizacion_id = null;

  corregir = false;
  origenes = [];
  destinos = [];

  myFormRemitente: FormGroup;
  myFormDestino: FormGroup;

  coloniasR = [];
  coloniasD = [];

  myFormPaquete: FormGroup;
  servicios = [];

  flujo = 1;

  catalogoProductos = [];
  catalogoMedidas = [];

  paymentForm: FormGroup;

  //para pruebas
  usuario = 'usuario1@correo.com';
  password = '12345';

  //Data Carta Porte pruebas
  claveProdServ = "53102903";
  descripcion_producto = "Ropa atlética para niño";  
  clave_unidad = "SET";  
  nombre_unidad = "Conjunto";


  formErrors = {
      "number":"",
      "name":"",
      "exp_year":"",
      "exp_month":"",
      "cvc":""
  };
  public cargo = {
    "usuario_id" : null,
    "name" : "",
    "email" : "",
    "phone": "",   
    "reference": 0,
    "random_key": 0,
    "token_id": "",
    "name_order": "Compra Guía Bennuu",
    "unit_price": 0,
    "quantity": "1",
    "amount": 0,
    "carrier": "Guias",
    "street1": "Av. Central 111 2",
    "postal_code": "43612",
    "more_info": "pago Bennuu",
    "servicio_id": "",
    "last4": null,
    "brand": "",
    "cvv": "",
    "titular": "",
    "total": 0,
  };

  public servSel = {
    "id" : null,
    "api" : null,
    "api_proveedor" : null,
    "comision" : null,
    "cotizacion_id": null,   
    "detalle": null,
    "imagen": null,
    "precio": null,
    "proveedor": null,
    "servicio_tipo": null,
    "servicio_tipo_aux": null,
    "total": null,
  };

  saldo = null;

  public resumenPago = {
    "proveedor" : null,
    "imagen" : null,
    "servicio_tipo_aux" : null,
    "detalle" : null,
    "total" : null,

    "tipo": null,   
    "alto": null,
    "ancho": null,
    "largo": null,
    "peso": null,

    "nombreR": null,
    "empresaR": null,
    "telefonoR": null,
    "direccionR": null,
    "cpR": null,
    "coloniaR": null,
    "estadoR": null,

    "nombreD": null,
    "empresaD": null,
    "telefonoD": null,
    "direccionD": null,
    "cpD": null,
    "coloniaD": null,
    "estadoD": null,
  };

  count_sobrepesos = 0;
  @ViewChild('modalSobrepesos') modalSobrepesos : ElementRef;

  //@ViewChild(TerminosComponent) TerminosC: TerminosComponent;

  user : any = null;

  @ViewChild('modalPagoPendiente') modalPagoPendiente : ElementRef;

  @ViewChild('content_print') content_print : ElementRef;
  fecha_pdf = null;

  origenesFilter = [];
  destinosFilter = [];

  paquetes = [];
  paquetesFilter = [];

  user_subusuario = null;

  showColonias = true;

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

      //produccion
      Conekta.setPublicKey('key_Xk0m8Uxj0sI9qxIfLhMhf1U');
      //pruebas
      //Conekta.setPublicKey('key_LPgvccXbEvtt7tGH2Zzw94Q');

      this.user = this.sesion_serv.getUser();
      this.user_subusuario  =  this.sesion_serv.getUserSubUsuario();

      // // this.initCotizacion();
      // // this.getPagoPendiente();
      this.countSobrepesosPendientes();
      this.crearFormRemitente();
      this.crearListenersFormRemitente();
      this.crearFormDestino();
      this.crearListenersFormDestino();
      // // this.misRemitentes();
      // // this.misDestinos();
      this.crearFormPaquete();
      this.crearListenersFormPaquete(); 
      this.crearFormPago();
      this.crearListenersFormPago();

      setTimeout(()=>{
        this.misRemitentes();
        //this.misPaquetes();
      },500);
      

    }

  ngOnInit(){
   
  }

  ngOnDestroy() {
    // acciones de destrucción
    this.closeModal('#modalSobrepesos');
    this.closeModal('#modalPagoPendiente');
    this.closeModal('#modalPaquete');
    this.closeModal('#modalTarima');
    this.closeModal('#modalTerminos');

    //this.cancelarCotizacion(this.cotizacion_id,0);
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
    $(modal_id).modal({ keyboard: false, backdrop: 'static' });   
    $(modal_id).modal('show');           
  }

  openModal2(modal_id){  
    $(modal_id).modal('show');           
  }

  closeModal(modal_id){
    $(modal_id).modal('hide');
  }

  terminos(){
    //this.TerminosC.initComponent();
    this.openModal2('#modalTerminos');
  }

  countSobrepesosPendientes(): void {

    this.count_sobrepesos = 0;

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var that = this;

    this.api_serv.getQuery(`sobrepesos/contador/pendientes`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.count_sobrepesos = data.count_sobrepesos;   
        that.loading = false;   

        if(that.count_sobrepesos > 0){
          Swal.close ();
          that.openModal('#modalSobrepesos');
          that.initCotizacion(false);
        }else{
          that.getPagoPendiente();
        } 

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  irSobrepesos(){
    this.router.navigateByUrl('/sobrepesos');
  }

  getPagoPendiente(): void {

    this.cotizacion_id = null;

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var that = this;

    this.api_serv.getQuery(`cotizador/pago_pendiente`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        if(data.bandera_pago == 1){
          //that.showToast('info', 'Info!', data.message);
          that.cotizacion_id = data.cotizacion_id;
          that.servSel = data.servSel;
          that.resumenPago = data.resumenPago;

          //preparar orden para pago con tarjeta
          //that.cargo.unit_price = (parseFloat(that.order.costo)-1)*100;
          that.cargo.unit_price = (data.servSel.total - 1)*100; //costo del serv seleccionado
          that.cargo.amount = 100;
          that.cargo.servicio_id = data.servSel.id;
          that.cargo.total = data.servSel.total;

          Swal.close ();
          that.openModal('#modalPagoPendiente');

        }else{
          that.initCotizacion();
        }  

      },
      error(msg) {
        console.log(msg);
        //that.tratarError(msg);
        that.initCotizacion();
      }
    });

  }


  irNuevaCotizacion(): void{

    this.closeModal('#modalPagoPendiente');

    this.cancelarCotizacion(this.cotizacion_id,1);
    
    setTimeout(()=>{
      this.initCotizacion();
    },200);
  }

  irPagoPendiente(): void{

    this.closeModal('#modalPagoPendiente');

    this.flujo = 4;
    this.scroll_to('id_scroll');
    this.miSaldo();

    this.mostrarBotonPayPal();
  }

  initCotizacion(flag = true): void {

    this.flujo = 1;

    if(flag){
      Swal.fire({
        title: 'Espere',
        text: 'Cargando',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();
    }
    
    var datos = {
      usuario : this.usuario,
      password : this.password,
    };

    var that = this;

    this.api_serv.postQuery(`cotizador/iniciar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.cotizacion_id = data.cotizacion_id;   
        Swal.close ();    

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  misRemitentes(): void {

    this.origenes = [];
    this.destinos = [];

    //this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`direcciones/mis/remitentes`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.origenes = data.direcciones;
        that.destinos = data.direcciones;   
        //that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        // that.loading = false;
        // that.tratarError(msg);
      }
    });

  }

  misDestinos(): void {

    this.destinos = [];

    //this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`direcciones/mis/destinos`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.destinos = data.direcciones;   
        //that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        // that.loading = false;
        // that.tratarError(msg);
      }
    });

  }

  crearFormRemitente() {

    let rfc = 'XAXX010101000';
    if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
      rfc = this.user.rfc;
    }

    this.myFormRemitente = this.fb.group({
      cp  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      alias  : ['', [ Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      calle  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(24), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      colonia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      referencia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      num_interior  : ['', [ Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      num_exterior  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      ciudad  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      ciudad2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado_code  : ['', [ Validators.required ]  ],
      estado2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      empresa  : ['', [ Validators.minLength(2), Validators.maxLength(28), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      nombre  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      apellido  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      email  : ['atn@nennuu.mx', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$') ]  ],
      telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
      rfc  : [rfc, [ Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      cotizacion_id  : ['', [ Validators.required ]  ],
      zipcode_valid  : [false],
      guardar  : [false],
      rfc_bandera  : [false],
      actualizar  : [false],
      id  : [''],
      actualizar_bandera  : [false],
      radios_dir  : [''],
      buscar  : [''],
    });     
       
  }

  crearListenersFormRemitente(){

    this.myFormRemitente.get('cp').valueChanges.subscribe( valor => {
      if(valor.length == 5){
        this.validarZipcode(valor, 0);        
      }else{
        this.myFormRemitente.patchValue({zipcode_valid : false});
      }
    }); 

    this.myFormRemitente.get('rfc_bandera').valueChanges.subscribe( valor => {
      if(!valor){
        let rfc = 'XAXX010101000';
        if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
          rfc = this.user.rfc;
        }
        this.myFormRemitente.patchValue({rfc : rfc});        
      }else{
        let rfc2 = '';
        if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
          rfc2 = this.user.rfc;
        }
        this.myFormRemitente.patchValue({rfc : rfc2});
      }
    });

    this.myFormRemitente.get('radios_dir').valueChanges.subscribe( valor => {
      if(valor == '1'){
        //console.log('actualizar');
        this.myFormRemitente.patchValue({actualizar : true});
        this.myFormRemitente.patchValue({guardar : false});
      }
      if(valor == '2'){
        //console.log('guardar');
        this.myFormRemitente.patchValue({actualizar : false});
        this.myFormRemitente.patchValue({guardar : true});
      } 
    });

    this.myFormRemitente.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 1){

        let searchLowerCase = valor.toLowerCase();

        this.origenesFilter = this.origenes.filter( item =>
          item.nombre.toLowerCase().includes( searchLowerCase ) ||
          item.apellido.toLowerCase().includes( searchLowerCase ) ||
          item.cp.toLowerCase().includes( searchLowerCase )
        );

      }else{
        this.origenesFilter = [];
      }
    });

  }

  cargarDataFormRemitente() {
    let rfc = 'XAXX010101000';
    if(this.user.validado == 1 && this.user.rfc != null && this.user.rfc != ''){
      rfc = this.user.rfc;
    }

    this.myFormRemitente.patchValue({cp : ''});
    this.myFormRemitente.patchValue({alias : ''});
    this.myFormRemitente.patchValue({calle : ''});
    this.myFormRemitente.patchValue({colonia : ''});
    this.myFormRemitente.patchValue({referencia : ''});
    this.myFormRemitente.patchValue({num_interior : ''});
    this.myFormRemitente.patchValue({num_exterior : ''});
    this.myFormRemitente.patchValue({ciudad : ''});
    this.myFormRemitente.patchValue({ciudad2 : ''});
    this.myFormRemitente.patchValue({estado : ''});
    this.myFormRemitente.patchValue({estado_code : ''});
    this.myFormRemitente.patchValue({estado2 : ''});
    this.myFormRemitente.patchValue({empresa : ''});
    this.myFormRemitente.patchValue({nombre : ''});
    this.myFormRemitente.patchValue({apellido : ''});
    this.myFormRemitente.patchValue({email : 'atn@nennuu.mx'});
    this.myFormRemitente.patchValue({telefono : ''});
    this.myFormRemitente.patchValue({rfc : rfc});
    this.myFormRemitente.patchValue({cotizacion_id : ''});
    this.myFormRemitente.patchValue({zipcode_valid : false});
    this.myFormRemitente.patchValue({guardar : false});
    this.myFormRemitente.patchValue({rfc_bandera : false});
    this.myFormRemitente.patchValue({actualizar : false});
    this.myFormRemitente.patchValue({id : ''});
    this.myFormRemitente.patchValue({actualizar_bandera : false});
    this.myFormRemitente.patchValue({radios_dir : ''});
    this.myFormRemitente.patchValue({buscar : ''});
  }

  get r_cpNoValido() {
    return this.myFormRemitente.get('cp').invalid && this.myFormRemitente.get('cp').touched
  }

  get r_aliasNoValido() {
    return this.myFormRemitente.get('alias').invalid && this.myFormRemitente.get('alias').touched
  }

  get r_calleNoValido() {
    return this.myFormRemitente.get('calle').invalid && this.myFormRemitente.get('calle').touched
  }

  get r_coloniaNoValido() {
    return this.myFormRemitente.get('colonia').invalid && this.myFormRemitente.get('colonia').touched
  }

  get r_referenciaNoValido() {
    return this.myFormRemitente.get('referencia').invalid && this.myFormRemitente.get('referencia').touched
  }

  get r_num_interiorNoValido() {
    return this.myFormRemitente.get('num_interior').invalid && this.myFormRemitente.get('num_interior').touched
  }

  get r_num_exteriorNoValido() {
    return this.myFormRemitente.get('num_exterior').invalid && this.myFormRemitente.get('num_exterior').touched
  }

  get r_ciudadNoValido() {
    return this.myFormRemitente.get('ciudad').invalid && this.myFormRemitente.get('ciudad').touched
  }

  get r_estadoNoValido() {
    return this.myFormRemitente.get('estado').invalid && this.myFormRemitente.get('estado').touched
  }

  get r_empresaNoValido() {
    return this.myFormRemitente.get('empresa').invalid && this.myFormRemitente.get('empresa').touched
  }

  get r_nombreNoValido() {
    return this.myFormRemitente.get('nombre').invalid && this.myFormRemitente.get('nombre').touched
  }

  get r_apellidoNoValido() {
    return this.myFormRemitente.get('apellido').invalid && this.myFormRemitente.get('apellido').touched
  }

  get r_emailNoValido() {
    return this.myFormRemitente.get('email').invalid && this.myFormRemitente.get('email').touched
  }

  get r_telefonoNoValido() {
    return this.myFormRemitente.get('telefono').invalid && this.myFormRemitente.get('telefono').touched
  }

  get r_rfcNoValido() {
    return this.myFormRemitente.get('rfc').invalid && this.myFormRemitente.get('rfc').touched
  }

  changeSetOrigen(id){
    console.log(id);
    let colonia = null;
    for (var i = 0; i < this.origenes.length; ++i) {
      if(id == this.origenes[i].id){
        this.myFormRemitente.patchValue({cp : this.origenes[i].cp});
        this.myFormRemitente.patchValue({alias : this.origenes[i].alias});
        this.myFormRemitente.patchValue({calle : this.origenes[i].calle});
        //this.myFormRemitente.patchValue({colonia : this.origenes[i].colonia});
        this.myFormRemitente.patchValue({referencia : this.origenes[i].referencia});
        this.myFormRemitente.patchValue({num_interior : this.origenes[i].num_interior});
        this.myFormRemitente.patchValue({num_exterior : this.origenes[i].num_exterior});
        this.myFormRemitente.patchValue({ciudad : this.origenes[i].ciudad});
        this.myFormRemitente.patchValue({ciudad2 : this.origenes[i].ciudad});
        this.myFormRemitente.patchValue({estado : this.origenes[i].estado});
        this.myFormRemitente.patchValue({estado_code : this.origenes[i].estado_code});
        this.myFormRemitente.patchValue({estado2 : this.origenes[i].estado});
        this.myFormRemitente.patchValue({empresa : this.origenes[i].empresa});
        this.myFormRemitente.patchValue({nombre : this.origenes[i].nombre});
        this.myFormRemitente.patchValue({apellido : this.origenes[i].apellido});
        // this.myFormRemitente.patchValue({email : this.origenes[i].email});
        this.myFormRemitente.patchValue({telefono : this.origenes[i].telefono});
        this.myFormRemitente.patchValue({rfc : this.origenes[i].rfc});
        this.myFormRemitente.patchValue({cotizacion_id : ''});
        this.myFormRemitente.patchValue({zipcode_valid : true});
        this.myFormRemitente.patchValue({guardar : false});
        if (this.origenes[i].rfc == 'XAXX010101000') {
          this.myFormRemitente.patchValue({rfc_bandera : false});
        }else{
          this.myFormRemitente.patchValue({rfc_bandera : true});
        }
        colonia = this.origenes[i].colonia;
        this.myFormRemitente.patchValue({actualizar : false});
        this.myFormRemitente.patchValue({id : this.origenes[i].id});
        this.myFormRemitente.patchValue({actualizar_bandera : true});
        this.myFormRemitente.patchValue({radios_dir : ''});

        this.origenesFilter = [];
        this.myFormRemitente.patchValue({buscar : ''});
      }
    }

    setTimeout(()=>{
      for (var j = 0; j < this.coloniasR.length; ++j) {
        if(colonia == this.coloniasR[j]){
          this.myFormRemitente.patchValue({colonia : this.coloniasR[j]});
        }
      }
    },2000);
    
  }

  changeSetColoniaR(event){
    console.log(event);
  }

  crearFormDestino() {

    this.myFormDestino = this.fb.group({
      cp  : ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]+$') ]  ],
      alias  : ['', [ Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      calle  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(24), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      colonia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      referencia  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      num_interior  : ['', [ Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      num_exterior  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(5), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      ciudad  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      ciudad2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado  : [{value:'', disabled: true}, [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      estado_code  : ['', [ Validators.required ]  ],
      estado2  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(30) ]  ],
      empresa  : ['', [ Validators.minLength(2), Validators.maxLength(28), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      nombre  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      apellido  : ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(14), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      email  : ['atn@nennuu.mx', [ Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$') ]  ],
      telefono  : ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]+$') ]  ],
      rfc  : ['XAXX010101000', [ Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern('^[a-z0-9A-Z]+$') ]  ],
      cotizacion_id  : ['', [ Validators.required ]  ],
      zipcode_valid  : [false],
      guardar  : [false],
      rfc_bandera  : [false],
      actualizar  : [false],
      id  : [''],
      actualizar_bandera  : [false],
      radios_dir  : [''],
      buscar  : [''],
    });     
       
  }

  cargarDataFormDestino() {
    this.myFormDestino.patchValue({cp : ''});
    this.myFormDestino.patchValue({alias : ''});
    this.myFormDestino.patchValue({calle : ''});
    this.myFormDestino.patchValue({colonia : ''});
    this.myFormDestino.patchValue({referencia : ''});
    this.myFormDestino.patchValue({num_interior : ''});
    this.myFormDestino.patchValue({num_exterior : ''});
    this.myFormDestino.patchValue({ciudad : ''});
    this.myFormDestino.patchValue({ciudad2 : ''});
    this.myFormDestino.patchValue({estado : ''});
    this.myFormDestino.patchValue({estado_code : ''});
    this.myFormDestino.patchValue({estado2 : ''});
    this.myFormDestino.patchValue({empresa : ''});
    this.myFormDestino.patchValue({nombre : ''});
    this.myFormDestino.patchValue({apellido : ''});
    this.myFormDestino.patchValue({email : 'atn@nennuu.mx'});
    this.myFormDestino.patchValue({telefono : ''});
    this.myFormDestino.patchValue({rfc : 'XAXX010101000'});
    this.myFormDestino.patchValue({cotizacion_id : ''});
    this.myFormDestino.patchValue({zipcode_valid : false});
    this.myFormDestino.patchValue({guardar : false});
    this.myFormDestino.patchValue({rfc_bandera : false});
    this.myFormDestino.patchValue({actualizar : false});
    this.myFormDestino.patchValue({id : ''});
    this.myFormDestino.patchValue({actualizar_bandera : false});
    this.myFormDestino.patchValue({radios_dir : ''});
    this.myFormDestino.patchValue({buscar : ''});
  }

  crearListenersFormDestino(){

    this.myFormDestino.get('cp').valueChanges.subscribe( valor => {
      if(valor.length == 5){
        this.validarZipcode(valor, 1);        
      }else{
        this.myFormDestino.patchValue({zipcode_valid : false});
      }
    }); 

    this.myFormDestino.get('rfc_bandera').valueChanges.subscribe( valor => {
      if(!valor){
        this.myFormDestino.patchValue({rfc : 'XAXX010101000'});        
      }else{
        this.myFormDestino.patchValue({rfc : ''});
      }
    });

    this.myFormDestino.get('radios_dir').valueChanges.subscribe( valor => {
      if(valor == '1'){
        //console.log('actualizar');
        this.myFormDestino.patchValue({actualizar : true});
        this.myFormDestino.patchValue({guardar : false});
      }
      if(valor == '2'){
        //console.log('guardar');
        this.myFormDestino.patchValue({actualizar : false});
        this.myFormDestino.patchValue({guardar : true});
      } 
    });

    this.myFormDestino.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 1){

        let searchLowerCase = valor.toLowerCase();

        this.destinosFilter = this.destinos.filter( item =>
          item.nombre.toLowerCase().includes( searchLowerCase ) ||
          item.apellido.toLowerCase().includes( searchLowerCase ) ||
          item.cp.toLowerCase().includes( searchLowerCase )
        );

      }else{
        this.destinosFilter = [];
      }
    });

  }

  get d_cpNoValido() {
    return this.myFormDestino.get('cp').invalid && this.myFormDestino.get('cp').touched
  }

  get d_aliasNoValido() {
    return this.myFormDestino.get('alias').invalid && this.myFormDestino.get('alias').touched
  }

  get d_calleNoValido() {
    return this.myFormDestino.get('calle').invalid && this.myFormDestino.get('calle').touched
  }

  get d_coloniaNoValido() {
    return this.myFormDestino.get('colonia').invalid && this.myFormDestino.get('colonia').touched
  }

  get d_referenciaNoValido() {
    return this.myFormDestino.get('referencia').invalid && this.myFormDestino.get('referencia').touched
  }

  get d_num_interiorNoValido() {
    return this.myFormDestino.get('num_interior').invalid && this.myFormDestino.get('num_interior').touched
  }

  get d_num_exteriorNoValido() {
    return this.myFormDestino.get('num_exterior').invalid && this.myFormDestino.get('num_exterior').touched
  }

  get d_ciudadNoValido() {
    return this.myFormDestino.get('ciudad').invalid && this.myFormDestino.get('ciudad').touched
  }

  get d_estadoNoValido() {
    return this.myFormDestino.get('estado').invalid && this.myFormDestino.get('estado').touched
  }

  get d_empresaNoValido() {
    return this.myFormDestino.get('empresa').invalid && this.myFormDestino.get('empresa').touched
  }

  get d_nombreNoValido() {
    return this.myFormDestino.get('nombre').invalid && this.myFormDestino.get('nombre').touched
  }

  get d_apellidoNoValido() {
    return this.myFormDestino.get('apellido').invalid && this.myFormDestino.get('apellido').touched
  }

  get d_emailNoValido() {
    return this.myFormDestino.get('email').invalid && this.myFormDestino.get('email').touched
  }

  get d_telefonoNoValido() {
    return this.myFormDestino.get('telefono').invalid && this.myFormDestino.get('telefono').touched
  }

  get d_rfcNoValido() {
    return this.myFormDestino.get('rfc').invalid && this.myFormDestino.get('rfc').touched
  }

  changeSetDestino(id){
    console.log(id);
    let colonia = null;
    for (var i = 0; i < this.destinos.length; ++i) {
      if(id == this.destinos[i].id){
        this.myFormDestino.patchValue({cp : this.destinos[i].cp});
        this.myFormDestino.patchValue({alias : this.destinos[i].alias});
        this.myFormDestino.patchValue({calle : this.destinos[i].calle});
        //this.myFormDestino.patchValue({colonia : this.destinos[i].colonia});
        this.myFormDestino.patchValue({referencia : this.destinos[i].referencia});
        this.myFormDestino.patchValue({num_interior : this.destinos[i].num_interior});
        this.myFormDestino.patchValue({num_exterior : this.destinos[i].num_exterior});
        this.myFormDestino.patchValue({ciudad : this.destinos[i].ciudad});
        this.myFormDestino.patchValue({ciudad2 : this.destinos[i].ciudad});
        this.myFormDestino.patchValue({estado : this.destinos[i].estado});
        this.myFormDestino.patchValue({estado_code : this.destinos[i].estado_code});
        this.myFormDestino.patchValue({estado2 : this.destinos[i].estado});
        this.myFormDestino.patchValue({empresa : this.destinos[i].empresa});
        this.myFormDestino.patchValue({nombre : this.destinos[i].nombre});
        this.myFormDestino.patchValue({apellido : this.destinos[i].apellido});
        // this.myFormDestino.patchValue({email : this.destinos[i].email});
        this.myFormDestino.patchValue({telefono : this.destinos[i].telefono});
        this.myFormDestino.patchValue({rfc : this.destinos[i].rfc});
        this.myFormDestino.patchValue({cotizacion_id : ''});
        this.myFormDestino.patchValue({zipcode_valid : true});
        this.myFormDestino.patchValue({guardar : false});
        if (this.destinos[i].rfc == 'XAXX010101000') {
          this.myFormDestino.patchValue({rfc_bandera : false});
        }else{
          this.myFormDestino.patchValue({rfc_bandera : true});
        }
        colonia = this.destinos[i].colonia;
        this.myFormDestino.patchValue({actualizar : false});
        this.myFormDestino.patchValue({id : this.destinos[i].id});
        this.myFormDestino.patchValue({actualizar_bandera : true});
        this.myFormDestino.patchValue({radios_dir : ''});

        this.destinosFilter = [];
        this.myFormDestino.patchValue({buscar : ''});
      }
    }

    setTimeout(()=>{
      for (var j = 0; j < this.coloniasD.length; ++j) {
        if(colonia == this.coloniasD[j]){
          this.myFormDestino.patchValue({colonia : this.coloniasD[j]});
        }
      }
    },2000);

  }

  validarDirecciones(){

    // if(this.count_sobrepesos > 0){
    //   this.openModal('#modalSobrepesos');
    // }else{

      console.log( this.myFormRemitente ); 
      console.log( this.myFormDestino );

      this.myFormRemitente.patchValue({cotizacion_id : this.cotizacion_id});
      this.myFormDestino.patchValue({cotizacion_id : this.cotizacion_id});

      if(!this.myFormRemitente.value.guardar && !this.myFormRemitente.value.actualizar){
        if(this.myFormRemitente.value.alias.length < 2){
          this.myFormRemitente.patchValue({alias : 'Remitente'});
        }  
      }
      if(!this.myFormDestino.value.guardar && !this.myFormDestino.value.actualizar){
        if(this.myFormDestino.value.alias.length < 2){
          this.myFormDestino.patchValue({alias : 'Destino'});
        }     
      }

      if(this.myFormRemitente.value.empresa == ''){
        this.myFormRemitente.patchValue({empresa : 'Particular'});
      }
      if(this.myFormDestino.value.empresa == ''){
        this.myFormDestino.patchValue({empresa : 'Particular'});
      }
      
      if((this.myFormRemitente.value.guardar || this.myFormRemitente.value.actualizar) &&
        (this.myFormRemitente.value.alias == '' || this.myFormRemitente.value.alias.length < 2)){
        Swal.fire({
          title: 'Warning',
          text: 'Álias Remitente Inválido',
          icon: 'warning'
        });
      }else if(!this.myFormRemitente.value.zipcode_valid){
        Swal.fire({
          title: 'Warning',
          text: 'CP Remitente Inválido',
          icon: 'warning'
        });
      }else if ( this.myFormRemitente.invalid ) {

        Swal.fire({
          title: 'Warning',
          text: 'Campos Inválidos en Origen',
          icon: 'warning'
        });

        return Object.values( this.myFormRemitente.controls ).forEach( control => {
          
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsTouched() );
          } else {
            control.markAsTouched();
          }
   
        });
       
      }else if((this.myFormDestino.value.guardar || this.myFormDestino.value.actualizar) &&
        (this.myFormDestino.value.alias == '' || this.myFormDestino.value.alias.length < 2)){
        Swal.fire({
          title: 'Warning',
          text: 'Álias Destino Inválido',
          icon: 'warning'
        });
      }else if(!this.myFormDestino.value.zipcode_valid){
        Swal.fire({
          title: 'Warning',
          text: 'CP Destino Inválido',
          icon: 'warning'
        });
      }else if ( this.myFormDestino.invalid ) {

        Swal.fire({
          title: 'Warning',
          text: 'Campos Inválidos en Destino',
          icon: 'warning'
        });

        return Object.values( this.myFormDestino.controls ).forEach( control => {
          
          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsTouched() );
          } else {
            control.markAsTouched();
          }
   
        });
       
      }else{
        this.crearRemitente();
      }
    //}

  }

  validarZipcode (zipcode, bandera) {

    if(bandera == 0){
      this.coloniasR = [];
      this.myFormRemitente.patchValue({colonia : ''});
      this.myFormRemitente.patchValue({ciudad : ''});
      this.myFormRemitente.patchValue({ciudad2 : ''});
      this.myFormRemitente.patchValue({estado : ''});
      this.myFormRemitente.patchValue({estado_code : ''});
      this.myFormRemitente.patchValue({estado2 : ''});
      this.myFormRemitente.patchValue({zipcode_valid : false});
    }

    if(bandera == 1){
      this.coloniasD = [];
      this.myFormDestino.patchValue({colonia : ''});
      this.myFormDestino.patchValue({ciudad : ''});
      this.myFormDestino.patchValue({ciudad2 : ''}); 
      this.myFormDestino.patchValue({estado : ''});
      this.myFormDestino.patchValue({estado_code : ''});
      this.myFormDestino.patchValue({estado2 : ''});
      this.myFormDestino.patchValue({zipcode_valid : false});     
    }

    Swal.fire({
      title: 'Espere',
      text: 'Validando Código Postal',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    //this.api_serv.getQuery(`cotizador/generico/zipcodes/${ zipcode }?country=MX`)
    this.api_serv.getQueryServ(`cotizador/generico/zipcodes/${ zipcode }?country=MX`)
    //this.api_serv.getQueryGoopy(`cotizador/zipcodes/${ zipcode }?country=MX`)
    .subscribe({
      next(data : any) {
        
        console.log(data);
         that.data=data;

         Swal.close ();

           if(bandera == 0){
            that.coloniasR = that.data.mi_envio.neighborhoods_list;
            that.myFormRemitente.patchValue({colonia : that.coloniasR[0]});
            that.myFormRemitente.patchValue({ciudad : that.data.mi_envio.municipality});
            that.myFormRemitente.patchValue({estado : that.data.mi_envio.state.name});
            that.myFormRemitente.patchValue({estado_code : that.data.mi_envio.state.code});
            that.myFormRemitente.patchValue({ciudad2 : that.data.mi_envio.municipality});
            that.myFormRemitente.patchValue({estado2 : that.data.mi_envio.state.name});
            that.myFormRemitente.patchValue({zipcode_valid : true});
          }

          if(bandera == 1){
            that.coloniasD = that.data.mi_envio.neighborhoods_list;
            that.myFormDestino.patchValue({colonia : that.coloniasD[0]});
            that.myFormDestino.patchValue({ciudad : that.data.mi_envio.municipality});
            that.myFormDestino.patchValue({estado : that.data.mi_envio.state.name});
            that.myFormDestino.patchValue({estado_code : that.data.mi_envio.state.code});
            that.myFormDestino.patchValue({ciudad2 : that.data.mi_envio.municipality});
            that.myFormDestino.patchValue({estado2 : that.data.mi_envio.state.name});
            that.myFormDestino.patchValue({zipcode_valid : true});      
          }   

      },
      error(msg) {

         that.tratarError(msg);
          
      }
    });
  }

  crearRemitente(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      cp  : this.myFormRemitente.value.cp,
      alias  : this.myFormRemitente.value.alias,
      calle  : this.myFormRemitente.value.calle,
      colonia  : this.myFormRemitente.value.colonia,
      referencia  : this.myFormRemitente.value.referencia,
      num_interior  : this.myFormRemitente.value.num_interior,
      num_exterior  : this.myFormRemitente.value.num_exterior,
      ciudad  : this.myFormRemitente.value.ciudad2,
      estado  : this.myFormRemitente.value.estado2,
      estado_code  : this.myFormRemitente.value.estado_code,
      empresa  : this.myFormRemitente.value.empresa,
      nombre  : this.myFormRemitente.value.nombre,
      apellido  : this.myFormRemitente.value.apellido,
      email  : this.myFormRemitente.value.email,
      telefono  : this.myFormRemitente.value.telefono,
      rfc  : this.myFormRemitente.value.rfc,
      cotizacion_id  : this.myFormRemitente.value.cotizacion_id,
      guardar  : this.myFormRemitente.value.guardar,
      actualizar  : this.myFormRemitente.value.actualizar,
      id  : this.myFormRemitente.value.id,
    };

    console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/remitente`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        /*if (that.myFormRemitente.value.guardar) {
          that.origenes.push(data.remitente);
        }*/ 
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.crearDestino();   

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  crearDestino(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      cp  : this.myFormDestino.value.cp,
      alias  : this.myFormDestino.value.alias,
      calle  : this.myFormDestino.value.calle,
      colonia  : this.myFormDestino.value.colonia,
      referencia  : this.myFormDestino.value.referencia,
      num_interior  : this.myFormDestino.value.num_interior,
      num_exterior  : this.myFormDestino.value.num_exterior,
      ciudad  : this.myFormDestino.value.ciudad2,
      estado  : this.myFormDestino.value.estado2,
      estado_code  : this.myFormDestino.value.estado_code,
      empresa  : this.myFormDestino.value.empresa,
      nombre  : this.myFormDestino.value.nombre,
      apellido  : this.myFormDestino.value.apellido,
      email  : this.myFormDestino.value.email,
      telefono  : this.myFormDestino.value.telefono,
      rfc  : this.myFormDestino.value.rfc,
      cotizacion_id  : this.myFormDestino.value.cotizacion_id,
      guardar  : this.myFormDestino.value.guardar,
      actualizar  : this.myFormDestino.value.actualizar,
      id  : this.myFormDestino.value.id,
    };

    console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/destino`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        /*if (that.myFormDestino.value.guardar) {
          that.destinos.push(data.destino);
        }*/
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });  

        that.flujo = 2; 
        that.scroll_to('id_scroll');

        setTimeout(()=>{
          that.myFormPaquete.patchValue({clave_unidad : 'H87'});
          that.myFormPaquete.patchValue({nombre_unidad : 'Pieza'});
          that.misPaquetes();
        },200); 

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  crearFormPaquete() {

    this.myFormPaquete = this.fb.group({
      largo  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      ancho  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      alto  : ['', [ Validators.required, Validators.min(1), Validators.max(100) ]  ],
      peso  : [{value:'', disabled: false}, [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      peso_volumetrico  : ['', [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      peso_cotizar  : ['', [ Validators.required, Validators.min(1), Validators.max(70) ]  ],
      tipo : ['Caja', [ Validators.required ]  ],
      cantidad  : [1, [ Validators.required, Validators.min(1) ]  ],
      descripcion  : ['', [ Validators.required, Validators.minLength(3), Validators.maxLength(25), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      valor_mercancia  : ['', [ Validators.required, Validators.min(100), Validators.max(10000) ]  ],
      claveProdServ  : ['01010101', [ Validators.required, Validators.minLength(3), Validators.maxLength(8) ]  ],
      descripcion_producto  : ['No existe en el catálogo', [ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]  ],
      clave_unidad  : ['H87', [ Validators.required, Validators.minLength(3), Validators.maxLength(3) ]  ],
      nombre_unidad  : ['Pieza', [ Validators.required, Validators.minLength(3), Validators.maxLength(105) ]  ],
      guardar  : [false],
      cotizacion_id  : ['', [ Validators.required ]  ],
      carta_porteA  : ['01010101-No existe en el catálogo', [ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]  ],
      carta_porteB  : ['H87-Pieza', [ Validators.required, Validators.minLength(3), Validators.maxLength(110) ]  ],
      terminos  : [false],
      alias  : ['', [ Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-z0-9A-ZÑñ\u00E0-\u00FC\u0020]+$') ]  ],
      actualizar  : [false],
      id  : [''],
      actualizar_bandera  : [false],
      radios_paquete  : [''],
      buscar  : [''],
      flag_recoleccion  : [false],
    });     
       
  }

  cargarDataFormPaquete(){
    this.myFormPaquete.patchValue({largo : ''});
    this.myFormPaquete.patchValue({ancho : ''});
    this.myFormPaquete.patchValue({alto : ''});
    this.myFormPaquete.patchValue({peso : ''});
    this.myFormPaquete.patchValue({peso_volumetrico : ''});
    this.myFormPaquete.patchValue({peso_cotizar : ''});
    this.myFormPaquete.patchValue({tipo : 'Caja'});
    this.myFormPaquete.patchValue({cantidad : 1});
    this.myFormPaquete.patchValue({descripcion : ''});
    this.myFormPaquete.patchValue({valor_mercancia : ''});
    this.myFormPaquete.patchValue({claveProdServ : '01010101'});
    this.myFormPaquete.patchValue({descripcion_producto : 'No existe en el catálogo'});
    this.myFormPaquete.patchValue({clave_unidad : 'H87'});
    this.myFormPaquete.patchValue({nombre_unidad : 'Pieza'});
    this.myFormPaquete.patchValue({guardar : false});
    this.myFormPaquete.patchValue({cotizacion_id : ''});
    this.myFormPaquete.patchValue({carta_porteA : '01010101-No existe en el catálogo'});
    this.myFormPaquete.patchValue({carta_porteB : 'H87-Pieza'});
    this.myFormPaquete.patchValue({terminos : false});
    this.myFormPaquete.patchValue({alias : ''});
    this.myFormPaquete.patchValue({actualizar : false});
    this.myFormPaquete.patchValue({id : ''});
    this.myFormPaquete.patchValue({actualizar_bandera : false});
    this.myFormPaquete.patchValue({radios_paquete : ''});
    this.myFormPaquete.patchValue({buscar : ''});
    this.myFormPaquete.patchValue({flag_recoleccion : false});
  }

  crearListenersFormPaquete(){
    this.myFormPaquete.valueChanges.subscribe( valor => {
      this.servicios = [];
      //this.ressetServSel();
    });

    this.myFormPaquete.get('largo').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('ancho').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('alto').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });
    this.myFormPaquete.get('peso').valueChanges.subscribe( valor => {
      this.calcularPesoCotizar();
    });

    /*this.myFormPaquete.get('carta_porteA').valueChanges.subscribe( valor => {
      if(valor.length >= 3){
        this.getCataogoProductos(valor);        
      }else{
        this.catalogoProductos = [];
      }

      this.myFormPaquete.patchValue({claveProdServ : ''});
      this.myFormPaquete.patchValue({descripcion_producto : ''});
    });

    this.myFormPaquete.get('carta_porteB').valueChanges.subscribe( valor => {
      if(valor.length >= 2){
        this.getCataogoMedidas(valor);        
      }else{
        this.catalogoMedidas = [];
      }

      this.myFormPaquete.patchValue({clave_unidad : ''});
      this.myFormPaquete.patchValue({nombre_unidad : ''});
    });*/

    this.myFormPaquete.get('tipo').valueChanges.subscribe(value => {
      const largoControl = this.myFormPaquete.get('largo');
      const anchoControl = this.myFormPaquete.get('ancho');
      const altoControl = this.myFormPaquete.get('alto');
      const pesoControl = this.myFormPaquete.get('peso');
      const peso_volumetricoControl = this.myFormPaquete.get('peso_volumetrico');
      const peso_cotizarControl = this.myFormPaquete.get('peso_cotizar');

      if (value === 'Tarima') {
        largoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        anchoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        altoControl.setValidators([Validators.required, Validators.min(110), Validators.max(1000)]);
        pesoControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
        peso_volumetricoControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
        peso_cotizarControl.setValidators([Validators.required, Validators.min(70), Validators.max(1000)]);
      } else {
        largoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        anchoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        altoControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        pesoControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
        peso_volumetricoControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
        peso_cotizarControl.setValidators([Validators.required, Validators.min(1), Validators.max(70)]);
      }

      // Actualiza la validación y el estado del formulario
      largoControl.updateValueAndValidity();
      anchoControl.updateValueAndValidity();
      altoControl.updateValueAndValidity();
      pesoControl.updateValueAndValidity();
      peso_volumetricoControl.updateValueAndValidity();
      peso_cotizarControl.updateValueAndValidity();
    });

    this.myFormPaquete.get('radios_paquete').valueChanges.subscribe( valor => {
      if(valor == '1'){
        //console.log('actualizar');
        this.myFormPaquete.patchValue({actualizar : true});
        this.myFormPaquete.patchValue({guardar : false});
      }
      if(valor == '2'){
        //console.log('guardar');
        this.myFormPaquete.patchValue({actualizar : false});
        this.myFormPaquete.patchValue({guardar : true});
      } 
    });

    this.myFormPaquete.get('buscar').valueChanges.subscribe( valor => {
      if(valor.length >= 1){

        let searchLowerCase = valor.toLowerCase();

        this.paquetesFilter = this.paquetes.filter( item =>
          item.alias.toLowerCase().includes( searchLowerCase ) ||
          item.tipo.toLowerCase().includes( searchLowerCase ) ||
          item.descripcion_producto.toLowerCase().includes( searchLowerCase )
        );

      }else{
        this.paquetesFilter = [];
      }
    });

  }

  misPaquetes(): void {

    this.paquetes = [];

    //this.loading = true;
    
    var that = this;

    this.api_serv.getQuery(`paquetes/mis/paquetes`)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.paquetes = data.paquetes;   
        //that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        // that.loading = false;
        // that.tratarError(msg);
      }
    });

  }

  changeSetPaquete(id){
    console.log(id);    
    for (var i = 0; i < this.paquetes.length; ++i) {
      if(id == this.paquetes[i].id){
        
        this.myFormPaquete.patchValue({largo : this.paquetes[i].largo});
        this.myFormPaquete.patchValue({ancho : this.paquetes[i].ancho});
        this.myFormPaquete.patchValue({alto : this.paquetes[i].alto});
        this.myFormPaquete.patchValue({peso : this.paquetes[i].peso_masa});
        this.myFormPaquete.patchValue({peso_volumetrico : this.paquetes[i].peso_vol});
        this.myFormPaquete.patchValue({peso_cotizar : this.paquetes[i].peso});
        this.myFormPaquete.patchValue({tipo : this.paquetes[i].tipo});
        this.myFormPaquete.patchValue({cantidad : this.paquetes[i].cantidad});
        this.myFormPaquete.patchValue({descripcion : this.paquetes[i].descripcion});
        this.myFormPaquete.patchValue({valor_mercancia : this.paquetes[i].valor_mercancia});

        this.myFormPaquete.patchValue({guardar : false});
        //this.myFormPaquete.patchValue({cotizacion_id : ''});
        this.myFormPaquete.patchValue({carta_porteA : this.paquetes[i].descripcion_producto});
        this.myFormPaquete.patchValue({carta_porteB : this.paquetes[i].clave_unidad+'-'+this.paquetes[i].nombre_unidad});
        this.myFormPaquete.patchValue({terminos : false});
        this.myFormPaquete.patchValue({alias : this.paquetes[i].alias});
        this.myFormPaquete.patchValue({actualizar : false});
        this.myFormPaquete.patchValue({id : this.paquetes[i].id});
        this.myFormPaquete.patchValue({actualizar_bandera : true});
        this.myFormPaquete.patchValue({radios_paquete : ''});
        this.myFormPaquete.patchValue({buscar : ''});
        this.myFormPaquete.patchValue({flag_recoleccion : false});

        this.paquetesFilter = [];

      }
    }

    setTimeout(()=>{
      for (var i = 0; i < this.paquetes.length; ++i) {
        if(id == this.paquetes[i].id){
            this.myFormPaquete.patchValue({claveProdServ : this.paquetes[i].claveProdServ});
            this.myFormPaquete.patchValue({descripcion_producto : this.paquetes[i].descripcion_producto});
            this.myFormPaquete.patchValue({clave_unidad : this.paquetes[i].clave_unidad});
            this.myFormPaquete.patchValue({nombre_unidad : this.paquetes[i].nombre_unidad});
        }
      }
    },1000);

    setTimeout(()=>{
      this.catalogoProductos = [];
    },2000);


  }

  get largoNoValido() {
    return this.myFormPaquete.get('largo').invalid && this.myFormPaquete.get('largo').touched
  }

  get anchoNoValido() {
    return this.myFormPaquete.get('ancho').invalid && this.myFormPaquete.get('ancho').touched
  }

  get altoNoValido() {
    return this.myFormPaquete.get('alto').invalid && this.myFormPaquete.get('alto').touched
  }

  get pesoNoValido() {
    return this.myFormPaquete.get('peso').invalid && this.myFormPaquete.get('peso').touched
  }

  get cantidadNoValido() {
    return this.myFormPaquete.get('cantidad').invalid && this.myFormPaquete.get('cantidad').touched
  }

  get descripcionNoValido() {
    return this.myFormPaquete.get('descripcion').invalid && this.myFormPaquete.get('descripcion').touched
  }

  get valor_mercanciaNoValido() {
    return this.myFormPaquete.get('valor_mercancia').invalid && this.myFormPaquete.get('valor_mercancia').touched
  }

  get claveProdServNoValido() {
    return this.myFormPaquete.get('claveProdServ').invalid && this.myFormPaquete.get('claveProdServ').touched
  }

  get descripcion_productoNoValido() {
    return this.myFormPaquete.get('descripcion_producto').invalid && this.myFormPaquete.get('descripcion_producto').touched
  }

  get clave_unidadNoValido() {
    return this.myFormPaquete.get('clave_unidad').invalid && this.myFormPaquete.get('clave_unidad').touched
  }

  get nombre_unidadNoValido() {
    return this.myFormPaquete.get('nombre_unidad').invalid && this.myFormPaquete.get('nombre_unidad').touched
  }

  get carta_porteANoValido() {
    return this.myFormPaquete.get('carta_porteA').invalid && this.myFormPaquete.get('carta_porteA').touched
  }

  get carta_porteBNoValido() {
    return this.myFormPaquete.get('carta_porteB').invalid && this.myFormPaquete.get('carta_porteB').touched
  }

  get p_aliasNoValido() {
    return this.myFormPaquete.get('alias').invalid && this.myFormPaquete.get('alias').touched
  }

  changeType(event){
    //console.log('event '+event);
    if(event == 'Sobre'){
      this.myFormPaquete.patchValue({largo : 1});
      this.myFormPaquete.patchValue({ancho : 1});
      this.myFormPaquete.patchValue({alto : 1});
      this.myFormPaquete.patchValue({peso : 1});
      this.myFormPaquete.controls['peso'].disable();
      this.calcularPesoCotizar();
    }else if(event == 'Caja' || event == 'Tarima'){
      this.myFormPaquete.patchValue({largo : ''});
      this.myFormPaquete.patchValue({ancho : ''});
      this.myFormPaquete.patchValue({alto : ''});
      this.myFormPaquete.patchValue({peso : ''});
      this.myFormPaquete.controls['peso'].enable();
    }

    return Object.values( this.myFormPaquete.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsUntouched() );
        } else {
          control.markAsUntouched();
        }
 
      });

  }

  calcularPesoCotizar(){
    let peso_masa = this.myFormPaquete.value.peso;
    let peso_volumetrico = 0;
    this.myFormPaquete.patchValue({peso_volumetrico : 0});
    let peso_cotizar = 0;
    this.myFormPaquete.patchValue({peso_cotizar : 0});

    peso_volumetrico = 
      (this.myFormPaquete.value.largo * this.myFormPaquete.value.ancho * this.myFormPaquete.value.alto) / 5000;
    peso_volumetrico = Math.ceil(peso_volumetrico);

    this.myFormPaquete.patchValue({peso_volumetrico : peso_volumetrico});

    if(peso_masa >= peso_volumetrico){
      peso_cotizar = peso_masa;
      this.myFormPaquete.patchValue({peso_cotizar : peso_masa});
    }else{
      peso_cotizar = peso_volumetrico;
      this.myFormPaquete.patchValue({peso_cotizar : peso_volumetrico});
    }

    // console.log('peso_masa '+peso_masa);
    // console.log('peso_volumetrico '+peso_volumetrico);
    // console.log('peso_cotizar '+peso_cotizar);

  }

  validarPaquete(){
    console.log( this.myFormPaquete ); 

    this.myFormPaquete.patchValue({cotizacion_id : this.cotizacion_id});

    if(!this.myFormPaquete.value.guardar && !this.myFormPaquete.value.actualizar){
      if(this.myFormPaquete.value.alias.length < 2){
        this.myFormPaquete.patchValue({alias : 'Paquete'});
      }  
    }

    if((this.myFormPaquete.value.guardar || this.myFormPaquete.value.actualizar) &&
      (this.myFormPaquete.value.alias == '' || this.myFormPaquete.value.alias.length < 2)){
      Swal.fire({
        title: 'Warning',
        text: 'Álias de Paquete Inválido',
        icon: 'warning'
      });
    }else if(!this.myFormPaquete.value.terminos){
      Swal.fire({
        title: 'Warning',
        text: 'Acepte el AVISO DE PRIVACIADAD para poder continuar.',
        icon: 'warning'
      });
    }else if ( this.myFormPaquete.invalid ) {

      Swal.fire({
        title: 'Warning',
        text: 'Campos Inválidos en Paquete',
        icon: 'warning'
      });

      return Object.values( this.myFormPaquete.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{
      this.crearPaquete();
    }

  }

  crearPaquete(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peso_masa = this.myFormPaquete.value.peso;

    if(this.myFormPaquete.value.tipo == "Sobre"){
      peso_masa = 1;
    }
    
    var datos = {
      largo  : this.myFormPaquete.value.largo,
      ancho  : this.myFormPaquete.value.ancho,
      alto  : this.myFormPaquete.value.alto,
      peso  : this.myFormPaquete.value.peso_cotizar,
      peso_masa  : peso_masa,
      peso_vol  : this.myFormPaquete.value.peso_volumetrico,
      tipo  : this.myFormPaquete.value.tipo,
      cantidad  : this.myFormPaquete.value.cantidad,
      descripcion  : this.myFormPaquete.value.descripcion,
      valor_mercancia  : this.myFormPaquete.value.valor_mercancia,
      claveProdServ  : this.myFormPaquete.value.claveProdServ,
      descripcion_producto  : this.myFormPaquete.value.descripcion_producto,
      clave_unidad  : this.myFormPaquete.value.clave_unidad,
      nombre_unidad  : this.myFormPaquete.value.nombre_unidad,
      guardar  : this.myFormPaquete.value.guardar,
      alias  : this.myFormPaquete.value.alias,
      cotizacion_id  : this.myFormPaquete.value.cotizacion_id,
      actualizar  : this.myFormPaquete.value.actualizar,
      id  : this.myFormPaquete.value.id,
      flag_recoleccion  : this.myFormPaquete.value.flag_recoleccion,
    };
    //console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/paquete`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        // if (that.myFormDestino.value.guardar) {
        //   that.paquetes.push(data.paquete);
        // }
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 

        that.cotizar();  

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  setResumenPagoFront(){
    this.resumenPago = {
      "proveedor" : this.servSel.proveedor,
      "imagen" : this.servSel.imagen,
      "servicio_tipo_aux" : this.servSel.servicio_tipo_aux,
      "detalle" : this.servSel.detalle,
      "total" : this.servSel.total,

      "tipo": this.myFormPaquete.value.tipo,   
      "alto": this.myFormPaquete.value.alto,
      "ancho": this.myFormPaquete.value.ancho,
      "largo": this.myFormPaquete.value.largo,
      "peso": this.myFormPaquete.value.peso_cotizar,

      "nombreR": this.myFormRemitente.value.nombre+' '+this.myFormRemitente.value.apellido,
      "empresaR": this.myFormRemitente.value.empresa,
      "telefonoR": this.myFormRemitente.value.telefono,
      "direccionR": this.myFormRemitente.value.calle+' '+this.myFormRemitente.value.num_exterior+' '+this.myFormRemitente.value.num_interior,
      "cpR": this.myFormRemitente.value.cp,
      "coloniaR": this.myFormRemitente.value.colonia,
      "estadoR": this.myFormRemitente.value.estado2,

      "nombreD": this.myFormDestino.value.nombre+' '+this.myFormDestino.value.apellido,
      "empresaD": this.myFormDestino.value.empresa,
      "telefonoD": this.myFormDestino.value.telefono,
      "direccionD": this.myFormDestino.value.calle+' '+this.myFormDestino.value.num_exterior+' '+this.myFormDestino.value.num_interior,
      "cpD": this.myFormDestino.value.cp,
      "coloniaD": this.myFormDestino.value.colonia,
      "estadoD": this.myFormDestino.value.estado2,
    };
  }

  reiniciarCotizacion(){

    this.flujo = 1;
    this.scroll_to('id_scroll');

    let coti_id = this.cotizacion_id;

    this.cotizacion_id = null;

    this.cancelarCotizacion(coti_id,1);

    Object.values( this.myFormRemitente.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    Object.values( this.myFormDestino.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    Object.values( this.myFormPaquete.controls ).forEach( control => {
        
      if ( control instanceof FormGroup ) {
        Object.values( control.controls ).forEach( control => control.markAsUntouched() );
      } else {
        control.markAsUntouched();
      }

    });

    this.corregir = true;
    this.coloniasR = [];
    this.coloniasD = [];
    let origenes_aux = this.origenes;
    let destinos_aux = this.destinos;
    this.origenes = [];
    this.destinos = [];
    this.servicios = [];
    
    this.cargarDataFormRemitente();
    this.cargarDataFormDestino();
    this.cargarDataFormPaquete();
    //this.initCotizacion();
    

    setTimeout(()=>{
      this.initCotizacion();
      this.origenes = origenes_aux;
      this.destinos = destinos_aux;
      this.corregir = false;
    },400);

    this.servSel = {
      "id" : null,
      "api" : null,
      "api_proveedor" : null,
      "comision" : null,
      "cotizacion_id": null,   
      "detalle": null,
      "imagen": null,
      "precio": null,
      "proveedor": null,
      "servicio_tipo": null,
      "servicio_tipo_aux": null,
      "total": null,
    };

    this.resumenPago = {
      "proveedor" : null,
      "imagen" : null,
      "servicio_tipo_aux" : null,
      "detalle" : null,
      "total" : null,

      "tipo": null,   
      "alto": null,
      "ancho": null,
      "largo": null,
      "peso": null,

      "nombreR": null,
      "empresaR": null,
      "telefonoR": null,
      "direccionR": null,
      "cpR": null,
      "coloniaR": null,
      "estadoR": null,

      "nombreD": null,
      "empresaD": null,
      "telefonoD": null,
      "direccionD": null,
      "cpD": null,
      "coloniaD": null,
      "estadoD": null,
    };

    this.misRemitentes();
    //this.misDestinos();
  }

  cotizar(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Consultando servicios...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.servicios = [];
    
    var datos = {
      cotizacion_id  : this.cotizacion_id,
    };
    //console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/cotizar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.servicios = data.servicios;
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });   

        that.flujo = 3; 
        that.scroll_to('id_scroll');

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });

  }

  cancelarCotizacion(cotizacion_id, bandera): void {

    //this.loading = true;
    
    var datos = {
      cotizacion_id  : cotizacion_id,
      bandera  : bandera,
    };
    //console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/cancelar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        //that.showToast('success', 'Success!', data.message);  
        //that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        //that.loading = false;
        //that.tratarError(msg);
      }
    });

  }

  getCataogoProductos(termino): void {

    //this.loading = true;    
    var that = this;
    this.api_serv.getQuery(`carta_porte/catalogo/productos?termino=${ termino }`)
    .subscribe({
      next(data : any) {
        console.log(data);         
        that.catalogoProductos = data.productos;   
        //that.loading = false;    
      },
      error(msg) {
        console.log(msg);
        //that.loading = false;
        //that.tratarError(msg);
      }
    });

  }

  changeSetclaveprodserv(event){
    //console.log(event);
    for (var i = 0; i < this.catalogoProductos.length; ++i) {
      if(this.catalogoProductos[i].c_claveprodserv == event){
        this.myFormPaquete.patchValue({carta_porteA : this.catalogoProductos[i].c_claveprodserv+'-'+this.catalogoProductos[i].descripcion});
        this.myFormPaquete.patchValue({claveProdServ : this.catalogoProductos[i].c_claveprodserv});
        this.myFormPaquete.patchValue({descripcion_producto : this.catalogoProductos[i].descripcion});
        this.catalogoProductos = [];
      }
    }  
  }

  getCataogoMedidas(termino): void {

    //this.loading = true;    
    var that = this;
    this.api_serv.getQuery(`carta_porte/catalogo/medidas?termino=${ termino }`)
    .subscribe({
      next(data : any) {
        console.log(data);         
        that.catalogoMedidas = data.medidas;   
        //that.loading = false;    
      },
      error(msg) {
        console.log(msg);
        //that.loading = false;
        //that.tratarError(msg);
      }
    });

  }

  changeSetClaveMedida(event){
    //console.log(event);
    for (var i = 0; i < this.catalogoMedidas.length; ++i) {
      if(this.catalogoMedidas[i].clave == event){
        this.myFormPaquete.patchValue({carta_porteB : this.catalogoMedidas[i].clave+'-'+this.catalogoMedidas[i].nombre});
        this.myFormPaquete.patchValue({clave_unidad : this.catalogoMedidas[i].clave});
        this.myFormPaquete.patchValue({nombre_unidad : this.catalogoMedidas[i].nombre});
        this.catalogoMedidas = [];
      }
    }  
  }

  blurCartaPorteA(){
    setTimeout(()=>{
      if(this.myFormPaquete.value.claveProdServ == ''){
        this.myFormPaquete.patchValue({carta_porteA : ''});
      }  
    },150);    
  }

  blurCartaPorteB(){
    setTimeout(()=>{
      if(this.myFormPaquete.value.clave_unidad == ''){
        this.myFormPaquete.patchValue({carta_porteB : ''});
      }
    },150);
  }

  seleccionarServicio(servicio): void {

    this.servSel = {
      "id" : null,
      "api" : null,
      "api_proveedor" : null,
      "comision" : null,
      "cotizacion_id": null,   
      "detalle": null,
      "imagen": null,
      "precio": null,
      "proveedor": null,
      "servicio_tipo": null,
      "servicio_tipo_aux": null,
      "total": null,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      servicio_id  : servicio.id,
    };
    //console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/seleccionar/servicio`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });  
        that.loading = false;   

        that.servSel = {
          "id" : servicio.id,
          "api" : servicio.api,
          "api_proveedor" : servicio.api_proveedor,
          "comision" : servicio.comision,
          "cotizacion_id": servicio.cotizacion_id,   
          "detalle": servicio.detalle,
          "imagen": servicio.imagen,
          "precio": servicio.precio,
          "proveedor": servicio.proveedor,
          "servicio_tipo": servicio.servicio_tipo,
          "servicio_tipo_aux": servicio.servicio_tipo_aux,
          "total": servicio.total,
        };

        //preparar orden para pago con tarjeta
        //that.cargo.unit_price = (parseFloat(that.order.costo)-1)*100;
        that.cargo.unit_price = (that.servSel.total - 1)*100; //costo del serv seleccionado
        that.cargo.amount = 100;
        that.cargo.servicio_id = that.servSel.id;
        that.cargo.total = that.servSel.total;

        that.setResumenPagoFront();
        that.flujo = 4;
        that.scroll_to('id_scroll');
        that.miSaldo();

        that.mostrarBotonPayPal();

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  crearFormPago() {
    this.paymentForm = this.fb.group({
      number: ['', [Validators.required]],
      name: ['', [Validators.required]],
      exp_year: ['', [Validators.required]],
      exp_month: ['', [Validators.required]],
      cvc: ['', [Validators.required]],
      check: [false]
    });
  }

  crearListenersFormPago(){
    this.paymentForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();

    this.cargo.usuario_id = this.sesion_serv.getUserId();
    this.cargo.name = this.sesion_serv.getUserNombre();
    this.cargo.phone = this.sesion_serv.getUserTelefono();
    this.cargo.email = this.sesion_serv.getUserEmail();
    this.cargo.reference = new Date().getTime();
    this.cargo.random_key = new Date().getTime();

    // //this.cargo.unit_price = (parseFloat(this.order.costo)-1)*100;
    // this.cargo.unit_price = (this.servSel.total - 1)*100; //costo del serv seleccionado
    // this.cargo.amount = 100;
    // this.cargo.servicio_id = this.servSel.id;
    // this.cargo.total = this.servSel.total;

    this.paymentForm.controls['number'].valueChanges.subscribe(
        (selectedValue) => {
          var target = selectedValue;
          if (selectedValue.toString().length > 16) {
            this.paymentForm.patchValue({number: selectedValue.substr(0, 16)});
            target = selectedValue.substr(0, 16);
          }
          var tgt = Conekta.card.validateNumber(target);
          if (!tgt) {
            this.paymentForm.controls['number'].setErrors({'incorrect': true});
          }
          var yr = Conekta.card.getBrand(selectedValue);
          if (yr) {
            this.cargo.brand = yr;
          }
        }
      );
      this.paymentForm.controls['cvc'].valueChanges.subscribe(
        (selectedValue) => {
          var cvv = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({cvc: selectedValue.substr(0, 4)});
            cvv = selectedValue.substr(0, 4);
          }
          var cv = Conekta.card.validateCVC(cvv);
          if (!cv) {
            this.paymentForm.controls['cvc'].setErrors({'incorrect': true});
          }
        }
      );
      this.paymentForm.controls['exp_month'].valueChanges.subscribe(
        (selectedValue) => {
          var month = selectedValue;
          if (selectedValue.toString().length > 2) {
            this.paymentForm.patchValue({exp_month: selectedValue.substr(0, 2)});
            month = selectedValue.substr(0, 2);
          }
          var mt = Conekta.card.validateExpirationDate(month, this.paymentForm.value.exp_year);
          if (this.paymentForm.value.exp_year != '') {
            if (!mt) {
              this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
              this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
            } else {
              this.paymentForm.controls['exp_year'].setErrors(null);
            }
          }          
        }
      );
      this.paymentForm.controls['exp_year'].valueChanges.subscribe(
        (selectedValue) => {
          var year = selectedValue;
          if (selectedValue.toString().length > 4) {
            this.paymentForm.patchValue({exp_year: selectedValue.substr(0, 4)});
            year = selectedValue.substr(0, 4);
          }
          var yr = Conekta.card.validateExpirationDate(this.paymentForm.value.exp_month,year);
          if (!yr) {
            this.paymentForm.controls['exp_month'].setErrors({'incorrect': true});
            this.paymentForm.controls['exp_year'].setErrors({'incorrect': true});
          } else {
            this.paymentForm.controls['exp_month'].setErrors(null);
          }
        }
      );
  }

  onValueChanged(data?: any) {
    if (!this.paymentForm) { return; }
    const form = this.paymentForm;

    for (const field in this.formErrors) { 
      const control = form.get(field);
      this.formErrors[field] = '';
      if (control && control.dirty && !control.valid) {
        for (const key in control.errors) {
          this.formErrors[field] += true;
          console.log(key);
        }
      } 
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf:true });
        this.onValueChanged();
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  pagar(form){
    if (this.paymentForm.valid) {
      Swal.fire({
        title: 'Espere',
        text: 'Validando información...',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();
      this.loading = true;
      var that = this;
      let pay = { "card": form.value};
      Conekta.Token.create(pay, function SuccessCallback(response) {
        console.log(response);
        that.cargo.token_id = response.id;           
        that.paymentCharge();
      }
      , function ErrorCallback(response) {
        console.log(response);
        Swal.fire({
          title: 'Error',
          text: response.message_to_purchaser,
          icon: 'error'
        });
        that.loading = false;
      });
      
    } else {
      this.validateAllFormFields(this.paymentForm);
      Swal.fire({
        title: 'Error',
        text: 'Faltan datos de la tarjeta',
        icon: 'error'
      });
    };
  };

  paymentCharge(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Generando el pago...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;

    var that = this;

    this.api_serv.postQuery(`conekta/order`, this.cargo)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        that.datos = data;
        if (that.datos.conekta.object === 'order') {
          if (that.datos.conekta.payment_status === "paid") {

            //Crear Guia
            that.crearGuia();

          }          
        }
        if (that.datos.conekta.object === 'error') {
            Swal.fire({
            title: 'Error',
            text: that.datos.conekta.details[0].message,
            icon: 'error'
          });
        }  
        that.loading = false;    

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        //that.tratarError(msg);
        Swal.fire({
          title: 'Error',
          text: msg.error.conekta.details[0].message,
          icon: 'error'
        });
      }
    });

  }

  miSaldo(): void {
    this.loading = true;
    var that = this;
    this.api_serv.getQuery(`usuario/saldo`)
    .subscribe({
      next(data : any) {
        console.log(data);         
        that.saldo = data.saldo;   
        that.loading = false;    
      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });
  }

  pagarConSaldo(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Generando el pago...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;

    var datos = {
      servicio_id  : this.servSel.id,
    };
    
    var that = this;

    this.api_serv.postQuery(`cotizador/pagar/servicio`,datos)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        //Crear Guia
        that.crearGuia();    

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  crearGuia(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Generando la guía...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;
    
    var datos = {
      //cotizacion_id  : this.cotizacion_id,
      servicio_id  : this.servSel.id,
    };
    //console.log(datos);

    var that = this;

    this.api_serv.postQuery(`cotizador/crear/guia`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        /*Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        }); 
        that.loading = false; 
        //that.miSaldo(); 
        setTimeout(()=>{
          that.router.navigateByUrl('/mis-guias');
        },1000);*/

        that.descargarGuia(data.guia);

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
        that.miSaldo();
        setTimeout(()=>{
          that.router.navigateByUrl('/mis-guias');
        },1000);
      }
    });

  }

  descargarGuia(guia){

    Swal.fire({
      title: 'Espere',
      text: 'Generando PDF...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    var datos = {
      guia : guia,
    };

    var that = this;

    this.api_serv.postQuery(`guias/descargar`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        Swal.close ();


        //base 64
        if(data.bandera_metodo == 1){
          that.printPdfGuia(data.pdf);
        }
        //link
        else if(data.bandera_metodo == 2){
          let anchor = document.createElement("a");
          anchor.href = data.pdf;
          anchor.target = "_blank"
          anchor.click();
        }

        setTimeout(()=>{
          that.router.navigateByUrl('/dashboard');
        },800);

        

      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  printPdfGuia(your_base64){
    var fileblob = this.b64toBlob(your_base64, 'application/pdf');
    var url = window.URL.createObjectURL(fileblob); 

    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank"
    anchor.click();
  }

  recargarSaldo(){
    this.router.navigateByUrl('/saldo');
  }

  private loadExternalScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script')
      scriptElement.src = scriptUrl
      scriptElement.onload = resolve
      document.body.appendChild(scriptElement)
    })
  }

  paymentSuccess(payment) {
    console.log(payment);
    if(payment.state == "approved" || payment.state == "completed" || payment.state == "COMPLETED"){
      // Swal.fire({
      //   title: 'Info',
      //   text: 'Pago completado',
      //   icon: 'info',
      // });
      this.pagarConPayPal();
    }else{
      Swal.fire({
        title: 'Error',
        text: 'Error al procesar el pago.',
        icon: 'error'
      });
    }
  }

  renderButtonPayPal(cost,selectedCurreny,self,paypal_production,paypal_sandbox,paypal_env): void {

    console.log('renderButtonPayPal');

    document.getElementById("paypal-button").innerHTML = "";

    let env = null;
    if(paypal_env == 0){
      env = 'sandbox';
    }else if(paypal_env == 1){
      env = 'production';
    }

    //reset earlier inserted paypal button
    paypal.Button.render({
      style: {
        //shape:   'rect',
        shape:   'pill',
        height :   40,
      },
      env: env,
      client: {
        production: paypal_production,
        sandbox: paypal_sandbox
      },
      commit: true,
      payment: function (data, actions) {
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: cost, currency: selectedCurreny }
              }
            ]
          }
        })
      },
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function (payment) {

          //alert('Payment Successful')
          self.paymentSuccess(payment);
          //console.log(payment)
        })
      }
    }, '#paypal-button');
  }

  mostrarBotonPayPal(){

    let comision = (this.servSel.total * 5)/100;
    let total = this.servSel.total + 5 + comision;

    // this.renderButtonPayPal(
    //   this.servSel.total,
    //   'MXN',
    //   this,
    //   'AYDm5MoqD21AUPQNoKQSWst_d1L9uB9HuD88Ak_zO_UOBoYKVDvuHtM3vTt7UpFjN0L8vwZ5f0q6J7Ry',
    //   'AYDm5MoqD21AUPQNoKQSWst_d1L9uB9HuD88Ak_zO_UOBoYKVDvuHtM3vTt7UpFjN0L8vwZ5f0q6J7Ry',
    //   0
    // );

    this.renderButtonPayPal(
      this.servSel.total,
      'MXN',
      this,
      'ASPCK0D1YXnxoBn75MQZvIRGH5rZovXnFTCWlHZzGISlZtA6S9aj-92by8efeCZNxJ7ODm7pk4Q7VGHi',
      'ASPCK0D1YXnxoBn75MQZvIRGH5rZovXnFTCWlHZzGISlZtA6S9aj-92by8efeCZNxJ7ODm7pk4Q7VGHi',
      1
    );
  }

  pagarConPayPal(): void {

    Swal.fire({
      title: 'Espere',
      text: 'Generando el pago...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    this.loading = true;

    var datos = {
      servicio_id  : this.servSel.id,
    };
    
    var that = this;

    this.api_serv.postQuery(`cotizador/pagar/servicio/paypal`,datos)
    .subscribe({
      next(data : any) {
        console.log(data);
          
        //Crear Guia
        that.crearGuia();    

      },
      error(msg) {
        console.log(msg);
        that.loading = false;
        that.tratarError(msg);
      }
    });

  }

  initfecha(){

    var fecha = new Date();
    //var fecha = Date.now();
    let diaActual = fecha.getDate();
    let mesActual = fecha.getMonth() + 1;
    let anioActual = fecha.getFullYear();

    this.fecha_pdf = diaActual+'/'+mesActual+'/'+anioActual;

  }

  print(): void {
    let printContents, popupWin;
    //printContents = document.getElementById('print-section').innerHTML;
    printContents = this.content_print.nativeElement.innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
          
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
              .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {
                    float: left;
               }
               .col-sm-12 {
                    width: 100%;
               }
               .col-sm-9 {
                    width: 75%;
               }
               .col-sm-3 {
                    width: 25%;
               }
               .form-control-static {
                 margin-bottom: 0px;
               }
            }
          </style>

        </head>

      <body onload="window.focus();window.print();window.close()"> ${printContents} </body>
      </html>`
    );
    //popupWin.document.close();
  }

  printPdf(){
    this.initfecha();
    setTimeout(()=>{
      this.print();
    },100);
  }

  async aCrearColonia(tipo) {
        
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: "Ingresa una colonia",
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Colonia" maxlength="30">`,
      focusConfirm: false,
      showCancelButton: true, // Habilitar botón de cancelar
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const colonia = (document.getElementById('swal-input1') as HTMLInputElement).value;
    
        if (!colonia || colonia.length > 30) {
          Swal.showValidationMessage("El campo Colonia es obligatorio y debe tener un máximo de 30 caracteres");
          return null;
        }
    
        return [colonia];
      }
    });
    
    if (isConfirmed && formValues) {
      const [colonia] = formValues;
      // Llamas a la función que necesitas pasando los valores

      //origen
      if(tipo == 1){
        let esta = false;

        for (let i = 0; i < this.coloniasR.length; i++) {
          if(colonia.toLowerCase() == this.coloniasR[i].toLowerCase()){
            this.myFormRemitente.patchValue({colonia : this.coloniasR[i]});
            esta = true;
          }
        }

        if(!esta){
          this.coloniasR.push(colonia);
          this.myFormRemitente.patchValue({colonia : colonia});
        }
      }

      //destino
      if(tipo == 2){
        let esta = false;

        for (let i = 0; i < this.coloniasD.length; i++) {
          if(colonia.toLowerCase() == this.coloniasD[i].toLowerCase()){
            this.myFormDestino.patchValue({colonia : this.coloniasD[i]});
            esta = true;
          }
        }

        if(!esta){
          this.coloniasD.push(colonia);
          this.myFormDestino.patchValue({colonia : colonia});
        }
      }

      
    }

  }

 


}
